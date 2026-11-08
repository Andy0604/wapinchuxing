'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = path.join(__dirname, '..', 'src');
const context = vm.createContext({
  localStorage: { getItem: () => null },
  window: { matchMedia: () => ({ matches: false }) }
});
for (const name of ['data.js', 'map.js', 'fleet-engine.js']) {
  const filename = path.join(source, 'js', name);
  vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
}
const { xy, lines, routeIds, createFleetSimulation } = vm.runInContext(
  '({xy, lines, routeIds, createFleetSimulation})', context
);

// The island stores each road as an absolute SVG polyline (M followed by point pairs).
// Reading its vertices lets us test the actual road geometry without a browser.
const svg = fs.readFileSync(path.join(source, 'assets', 'island.svg'), 'utf8');
function readRoute(id) {
  const tag = svg.match(new RegExp('<path\\b[^>]*\\bid="route-' + id + '"[^>]*>'));
  assert.ok(tag, 'SVG route exists: ' + id);
  const d = tag[0].match(/\bd="([^"]+)"/)[1];
  assert.match(d, /^M[-+.0-9,\s]+$/, 'expected a single absolute polyline: ' + id);
  const numbers = d.slice(1).trim().split(/[\s,]+/).map(Number);
  assert.ok(numbers.length >= 4 && numbers.length % 2 === 0 && numbers.every(Number.isFinite));
  const points = [];
  for (let i = 0; i < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
  return points;
}
const fleet = createFleetSimulation(routeIds.map(readRoute), xy, lines);
const secondsPerHour = 3600;
const epsilon = 1e-7;

// Conversion from the island's map coordinates to road metres, along its two axes.
function metres(a, b) {
  return Math.hypot((a[0] - b[0]) * 8.630090862, (a[1] - b[1]) * 14.061206786);
}
function pathKm(points) {
  let distance = 0;
  for (let i = 1; i < points.length; i++) distance += metres(points[i - 1], points[i]);
  return distance / 1000;
}

test('三条线路共十三辆在岗运营车辆，车辆编号唯一，核载均为七人', () => {
  assert.equal(lines.length, 3);
  assert.equal(fleet.vehicles.length, 13);
  assert.equal(new Set(fleet.vehicles.map(v => v.id)).size, 13);
  const counts = [5, 4, 4];
  lines.forEach((line, i) => {
    const group = fleet.vehicles.filter(vehicle => vehicle.line === i);
    assert.equal(group.length, counts[i], line.name);
    for (const vehicle of group) assert.equal(vehicle.capacity, 7, vehicle.id);
  });
});

test('三小时模拟中实载始终为零至七人的整数，出现满载班次', () => {
  let maximum = 0;
  for (const vehicle of fleet.vehicles) {
    for (let time = 0; time <= 3 * secondsPerHour; time += 17) {
      const state = fleet.sample(vehicle, time);
      assert.equal(state.capacity, 7);
      assert.ok(Number.isInteger(state.passengers) &&
        state.passengers >= 0 && state.passengers <= state.capacity, vehicle.id);
      maximum = Math.max(maximum, state.passengers);
    }
  }
  assert.equal(maximum, 7);
});

test('车辆停靠时静止，行驶时里程递增，换班折返时位置连续', () => {
  const step = 5;
  for (const vehicle of fleet.vehicles) {
    let last = fleet.sample(vehicle, 0);
    let dwellChecks = 0, drivingChecks = 0, boundaries = 0;
    for (let t = step; t <= 2 * secondsPerHour; t += step) {
      const now = fleet.sample(vehicle, t);
      const km = now.traveledKm;
      assert.ok(Number.isFinite(km) && km >= 0 && km <= now.totalKm + epsilon);
      assert.ok(now.progress >= 0 && now.progress <= 1 + epsilon);
      assert.ok(Math.abs(km - now.totalKm * now.progress) < epsilon);
      // Maximum cruise speed in this demonstration is 30 km/h. The same spatial
      // bound also applies across stop transitions and across a change of trip.
      const maxKm = 30 * step / secondsPerHour + epsilon;
      assert.ok(metres(now.xy, last.xy) / 1000 <= maxKm, vehicle.id + ' position jumped');
      if (now.tripId === last.tripId) {
        const delta = km - last.traveledKm;
        assert.ok(delta >= -epsilon && delta <= maxKm, vehicle.id + ' mileage jumped');
        if (now.status === '停靠中' && last.status === '停靠中' && now.currentStop === last.currentStop) {
          assert.equal(now.speed, 0);
          assert.ok(Math.abs(delta) < epsilon && metres(now.xy, last.xy) < epsilon);
          dwellChecks++;
        }
        if (now.status === '行驶中' && last.status === '行驶中' && now.prevStop === last.prevStop) {
          assert.ok(delta > 0, vehicle.id + ' moving trip failed to advance');
          drivingChecks++;
        }
      } else {
        assert.equal(last.to, now.from);
        assert.ok(now.traveledKm < epsilon);
        boundaries++;
      }
      last = now;
    }
    assert.ok(dwellChecks && drivingChecks && boundaries, vehicle.id + ' missed a trip phase');
  }
});

test('已行与待行轨迹在当前位置衔接，路径长度与本程里程相符', () => {
  for (const vehicle of fleet.vehicles) {
    for (let t = 0; t <= 2 * secondsPerHour; t += 127) {
      const state = fleet.sample(vehicle, t);
      const traveled = state.trail, remaining = state.remaining;
      assert.deepEqual(traveled.at(-1), state.xy);
      assert.deepEqual(remaining[0], state.xy);
      assert.deepEqual(state.recentTrail.at(-1), state.xy);
      const traveledKm = pathKm(traveled);
      assert.ok(Math.abs(traveledKm - state.traveledKm) < epsilon, vehicle.id);
      assert.ok(Math.abs(traveledKm + pathKm(remaining) - state.totalKm) < epsilon, vehicle.id);
    }
  }
});
