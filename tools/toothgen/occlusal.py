"""Generate class-specific occlusal templates from the two authored drawings.

Two drawings carried all twenty posterior teeth: one premolar and one molar,
with nothing distinguishing upper from lower. What separates the classes in the
outline is a PROPORTION - upper premolars and molars are buccolingually longer,
lower molars mesiodistally longer - and a proportion is a coordinate
transformation, which is what this file does.

What it deliberately does NOT do is change cusp topology. Four cusps plus an
oblique ridge on the upper molar, five on the lower first, are authored artwork;
moving points cannot add them (odontogram-vlw scope note).

The transformation is a single x-scale about the drawing's centre, applied to
every registered layer through the same `rewrite_svg` path the side views use,
so the per-surface caries, filling and defect layers keep registration with the
outline they sit on.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import roots
import fillings  # noqa: E402
from build import ASSETS, SOURCE, rewrite_svg, namespace_paint_servers  # noqa: E402


@dataclass(frozen=True)
class OcclSpec:
    key: str
    label: str
    src: str
    ratio: float
    source: str
    teeth: tuple[int, ...]


# Buccolingual to mesiodistal, measured off the plates in
# zahnrad-odontogram/docs/images by isolating each specimen from its black
# ground. Where a plate shows two crown-type variants, the class value is their
# mean; where two teeth of a class were measured, the mean of the two.
OCCL_SPECS: list[OcclSpec] = [
    OcclSpec(
        key="14_occl",
        label="Upper premolar, occlusal",
        src="14_occl",
        ratio=1.25,
        source="Bild 53 (p. 71) 1.24 / Bild 55 (p. 73) 1.26",
        teeth=(14, 15, 24, 25),
    ),
    OcclSpec(
        key="34_occl",
        label="Lower premolar, occlusal",
        src="14_occl",
        ratio=1.35,
        source="Bild 59 (p. 77) / Bild 61 (p. 78), read by Dirk 2026-08-10",
        teeth=(34, 35, 44, 45),
    ),
    OcclSpec(
        key="16_occl",
        label="Upper molar, occlusal",
        src="16_occl",
        ratio=1.29,
        source="Bild 65 (p. 85) 1.24 / Bild 69 (p. 87) 1.34",
        teeth=(16, 17, 18, 26, 27, 28),
    ),
    OcclSpec(
        key="46_occl",
        label="Lower molar, occlusal",
        src="16_occl",
        ratio=0.95,
        source="Bild 75 (p. 95) 0.99 / Bild 77 (p. 97) 0.90",
        teeth=(36, 37, 38, 46, 47, 48),
    ),
]


def outline_extent(txt: str):
    """The `tooth-base` outline's mesiodistal and buccolingual extent."""

    i = txt.find('id="tooth-base"')
    if i < 0:
        raise SystemExit("tooth-base not found")
    m = re.search(r'\sd="([^"]+)"', txt[i : i + 6000])
    pts = [p for sub in roots._polylines(m.group(1)) for p in sub]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return max(xs) - min(xs), max(ys) - min(ys), (min(xs) + max(xs)) / 2


def connect_fillings(txt: str) -> str:
    """Join each proximal filling to the occlusal one. See fillings.py.

    Seen from above the box grows toward the middle of the tooth, so the axis is
    x - mesial toward -x, distal toward +x - where on the side view it is y.
    That is the only difference; the stretch itself is the same code.
    """
    band = re.search(r'<path id="filling-composite-occlusal" d="([^"]+)"', txt)
    # tooth-base is not written as `<path id=... d=...>` in these sources, so it
    # is located the same way outline_extent already does it rather than by a
    # regex that happens to fit the filling layers.
    i = txt.find('id="tooth-base"')
    base = re.search(r'\sd="([^"]+)"', txt[i : i + 6000]) if i >= 0 else None
    if not band or not base:
        return txt
    pts = [p for sub in roots._polylines(base.group(1)) for p in sub]
    x_lo, x_hi = min(p[0] for p in pts), max(p[0] for p in pts)
    # `edge` is the edge the box grows TOWARD, so it is the far side of the
    # tooth in the direction of the stretch, not the side the shape starts on.
    for surf, sign, edge in (("mesial", -1.0, x_lo), ("distal", 1.0, x_hi)):
        m = re.search(rf'<path id="filling-composite-{surf}" d="([^"]+)"', txt)
        if not m:
            continue
        # No contour-following here, deliberately. On the side view the crown
        # narrows gently toward the cusp tips and a box that grows occlusally
        # should narrow with it. Seen from ABOVE the outline is a rounded lobe:
        # a proximal box moved toward the centre would be scaled up by how much
        # taller the tooth is there, and it ballooned sixteen units outside the
        # contour when it was. A box keeps its buccolingual extent.
        new = fillings.stretch_to_band(
            m.group(1), band.group(1), edge, None, axis="x", sign=sign
        )
        if new is None or new == m.group(1):
            continue
        for mat in fillings.MATERIALS:
            txt = re.sub(
                rf'(<path id="filling-{mat}-{surf}" d=")[^"]+(")',
                lambda mm: mm.group(1) + new + mm.group(2),
                txt,
                count=1,
            )
    return txt


def build_one(spec: OcclSpec, out_dir: Path, dry: bool) -> None:
    txt = (SOURCE / f"{spec.src}.svg").read_text()
    w, h, cx = outline_extent(txt)
    have = h / w
    k = have / spec.ratio  # scaling x by k turns ratio h/w into h/(w*k)

    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', txt).group(1).split()]
    vb_new = (vb[0], vb[1], vb[2], vb[3])

    def fn(x, y):
        return (cx + (x - cx) * k, y)

    out = rewrite_svg(txt, fn, lambda y: y, vb_new)
    out = connect_fillings(out)
    out = namespace_paint_servers(out, spec.key)

    got_w, got_h, _ = outline_extent(out)
    meta = (
        f"<!-- toothgen: template={spec.key} src={spec.src} view=occlusal"
        f" ratio={got_h / got_w:.3f} target={spec.ratio:.2f}"
        f' source="{spec.source}" -->\n'
    )
    out = out.replace("<svg ", meta + f'<svg data-tooth-template="{spec.key}" ', 1)

    if not dry:
        (out_dir / f"{spec.key}.svg").write_text(out)
    print(
        f"{'DRY ' if dry else ''}{spec.key:9s} {spec.label:28s} "
        f"b/m {have:.2f} -> {got_h / got_w:.2f} (target {spec.ratio:.2f})  "
        f"x-scale {k:.3f}  {len(out) // 1024} KB"
    )


def main(argv: list[str]) -> int:
    dry = "--dry-run" in argv
    out_dir = ASSETS
    for spec in OCCL_SPECS:
        build_one(spec, out_dir, dry)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
