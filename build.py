"""Build the self-contained dashboard with Python 3's standard library."""
from pathlib import Path
import re
from tempfile import NamedTemporaryFile

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
OUTPUT = ROOT / "dist" / "index.html"

# Preserve cascade order and the dependency order of the browser scripts.
STYLES = ("style", "panels", "fleet-ui", "fleet-scene", "glass", "map-bleed", "ultrawide")
SCRIPTS = (
    "icons", "data", "charts", "panels", "city", "map", "fleet-engine",
    "fleet-ui", "fleet-map", "fleet-screen", "app",
)


def read_source(relative_path):
    return (SRC / relative_path).read_text(encoding="utf-8")


def assemble():
    template = read_source("base.html")
    styles = "\n".join(read_source("css/" + name + ".css") for name in STYLES)
    scripts = "\n".join(read_source("js/" + name + ".js") for name in SCRIPTS)
    buildings = read_source("assets/buildings.json")
    svg = read_source("assets/island.svg")
    drawing = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", svg.strip())
    contents = {
        "__CSS__": styles,
        "__ISLAND__": drawing,
        "__JS__": "const buildingData=" + buildings + ";\n" + scripts,
    }
    for marker in contents:
        if template.count(marker) != 1:
            raise ValueError("src/base.html must contain one " + marker)
    template = template.replace(
        '<html lang="zh-CN">',
        '<html lang="zh-CN" xmlns:xlink="http://www.w3.org/1999/xlink">',
    )
    return re.sub(r"__CSS__|__ISLAND__|__JS__", lambda m: contents[m.group()], template)


def main():
    page = assemble().encode("utf-8")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(dir=OUTPUT.parent, delete=False) as temporary:
        temporary.write(page)
        temporary_path = Path(temporary.name)
    try:
        temporary_path.replace(OUTPUT)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()
    print("Built dist/index.html ({} bytes)".format(len(page)))


if __name__ == "__main__":
    main()
