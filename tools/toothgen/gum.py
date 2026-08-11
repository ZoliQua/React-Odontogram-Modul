"""Draw the gingiva so that the row shares one line.

The source drawings carry a hand-drawn gum outline per tooth. Each one is
correct on its own and none of them can be right together: the papilla between
two teeth is ONE structure at ONE height, and two halves coming from two
different drawings have no way to agree on that height. Warping the drawn
outlines into agreement was tried twice and is closed as a route - see the
notes in odontogram-qyc; a hand-drawn gum is almost entirely long cubics, and
the ones that carry the papilla are exactly the ones a shift by x deforms.

So the outline is drawn here instead, in the template's FINAL coordinates,
after the warp. Three facts make that possible:

* every template puts its occlusal plane the same distance above the viewBox
  bottom (``build.OCCL_MARGIN``, asserted by verify.py), so a height measured
  from the occlusal plane means the same thing in every template;
* each template knows the width of the grid column it stands in
  (``ToothSpec.col_px``), which is what lets it put the papilla on the joint
  rather than on its own edge; and
* ``collectActiveLayers`` fingerprints id, opacity and class - never geometry -
  so replacing the path data leaves SVG parity byte-identical.

The band has two boundaries, and they are deliberately unlike each other:

    crest   ______________________________________________  bone level
                    ___                       ___
    papilla ___/       \\_____________/       \\___  free gingival margin

The APICAL one is a straight line at ``CREST_H``, the same in every template,
so the boundary between bone and gum is one line across the whole arch. It can
be straight because the part of the alveolar crest that scallops is the part
the tooth is drawn over: the crest only shows beside the root, and there it is
level anyway.

The CORONAL one is the free gingival margin, and it is the line the eye
actually follows. It rises to ``PAPILLA_H`` between the teeth and dips to this
tooth's own cervix in the middle - so the margin still moves per tooth, which
is what it does in the mouth, while the papillae land at one height. Both
constants have to be constants for the same reason: a papilla is shared between
two teeth, and neither template knows which tooth it will stand next to.

Each transition is ONE cubic, and a smoothstep IS a cubic Bezier exactly
(control ordinates a, a, b, b over an evenly spaced abscissa), so it arrives at
the papilla with a horizontal tangent. That is what lets two neighbours meet
without a seam: both are flat where they touch, so their union has a smooth
peak instead of a corner or a step.

The bone is drawn here too, and for the same reason. Bone and gum are one
figure - the gum is draped over the crest - so redrawing one and leaving the
other would open white slivers wherever the two outlines stopped nesting. It is
the plain block it always was, but it now ends at the gum's own crest line, a
little coronal to it so the gum covers the join, and reaches the same distance
sideways so the row has no gaps to show through.
"""

from __future__ import annotations


# Heights above the occlusal plane, in template units.
#
# CREST_H is the bone-gum boundary. One number for the whole arch: it has to
# clear the highest cervix in the set (tpl 11 at 33.1) with room for the band
# to be a band, and stay under the lowest root apex (tpl 16 at 63.6) so bone is
# still drawn around every root.
CREST_H = 36.0

# How far the papilla reaches coronally into the embrasure. Measured against
# the cervix it gives a long pointed papilla between the incisors (long crowns,
# high cervix) and a short blunt one between the molars, which is the way round
# the mouth has it. It has to stay coronal to the LOWEST cervix in the set
# (tpl 46 at 24.8) or that tooth's margin would run the wrong way.
PAPILLA_H = 19.0

# Where the margin sits relative to THIS tooth's cervical line, and how far the
# dip runs sideways as a multiple of the tooth's own half width AT THAT HEIGHT.
# Just under 1, so the margin stays down until the tooth's outline lets go of
# it and only then rises: the gum is drawn behind the tooth, so this is what
# decides how much of the scallop is actually visible.
MARGIN_DOWN = 2.0
MARGIN_SPREAD = 0.92

# How steeply the margin leaves the tooth: the near control ordinate of the
# transition, as a fraction of the way to the tooth end. 1.0 would be flat.
TOOTH_END_SLOPE = 0.45

# How far past the papilla the band keeps going, so that two neighbours
# genuinely overlap there instead of meeting at a mathematical point. Both are
# flat over the whole overlap, so its width does not show.
EXT = 3.0

# How far the bone reaches coronally past the crest line, so the gum covers the
# join instead of abutting it and showing a hairline.
BONE_OVERLAP = 2.0

# Where the bone block ends apically. One number for the whole arch, for the
# same reason the crest is: the jaw does not step from tooth to tooth. It sits
# just inside the tallest template (tpl 14, 81.6 above the occlusal plane) and
# is drawn past the viewBox on every shorter one, which the row has the height
# for and `overflow: visible` on the tile SVG now lets through.
BONE_TOP_H = 81.0

# Grid gap between two tiles, in CSS pixels, and the scale that turns pixels
# into template units. Both mirror src/index.css and tools/toothgen/build.py.
GRID_GAP_PX = 4.0
PX_PER_UNIT = 1.62


def _ease(xa: float, ya: float, xb: float, yb: float, flat_b: bool = True) -> str:
    """One cubic from (xa,ya) to (xb,yb), horizontal at the ``a`` end.

    With ``flat_b`` it is horizontal at both ends: control ordinates ya, ya,
    yb, yb over an evenly spaced abscissa give y(t) = ya + (yb-ya)(3t^2-2t^3),
    which is the smoothstep itself and not an approximation of it. That is the
    papilla end, and it has to be flat so two neighbours meet without a corner.

    At the tooth end it must NOT be flat. A curve that arrives horizontal there
    leaves the crown's silhouette running sideways, and what shows beside the
    tooth is a squared-off tab rather than a margin hugging the neck. Dropping
    the near control ordinate to ``TOOTH_END_SLOPE`` of the way gives it a
    slope to come off the tooth with.
    """
    d = xb - xa
    c2 = yb if flat_b else ya + (yb - ya) * TOOTH_END_SLOPE
    return f"C{xa + d / 3:.2f},{ya:.2f} {xa + 2 * d / 3:.2f},{c2:.2f} {xb:.2f},{yb:.2f}"


def _rev_ease(xa: float, ya: float, xb: float, yb: float) -> str:
    """The mirror of ``_ease``: horizontal at the ``b`` end, sloped at ``a``."""
    d = xb - xa
    c1 = yb + (ya - yb) * TOOTH_END_SLOPE
    return f"C{xa + d / 3:.2f},{c1:.2f} {xa + 2 * d / 3:.2f},{yb:.2f} {xb:.2f},{yb:.2f}"


def half_pitch(col_px: float) -> float:
    """Half the distance to the neighbouring tooth, in template units."""
    return (col_px + GRID_GAP_PX) / 2.0 / PX_PER_UNIT


def _span(cx: float, neck_half: float, col_px: float):
    """Joint, margin-dip and outer x positions, left and right of ``cx``."""
    hp = half_pitch(col_px)
    xkn_l, xkn_r = cx - hp, cx + hp
    half = neck_half * MARGIN_SPREAD
    # A wide tooth in a narrow column can push the dip past the joint. Keep a
    # transition of at least a unit on each side so it never runs backwards.
    xma_l = max(cx - half, xkn_l + 1.0)
    xma_r = min(cx + half, xkn_r - 1.0)
    if xma_l >= xma_r:
        xma_l = xma_r = cx
    return xkn_l - EXT, xkn_l, xma_l, xma_r, xkn_r, xkn_r + EXT


def gum_path(
    occl: float,
    cej: float,
    cx: float,
    neck_half: float,
    col_px: float,
) -> str:
    """The gum band for one template, in that template's final coordinates.

    ``occl`` is the y of the occlusal plane, ``cej`` the y of the cervical
    line, ``cx`` the tooth's centre, ``neck_half`` its half width at the height
    the margin sits at, and ``col_px`` the width of its grid column.
    """
    y_crest = occl - CREST_H
    y_pap = occl - PAPILLA_H
    y_marg = cej + MARGIN_DOWN
    xl, xkn_l, xma_l, xma_r, xkn_r, xr = _span(cx, neck_half, col_px)

    return (
        f"M{xl:.2f},{y_crest:.2f}"
        f"L{xr:.2f},{y_crest:.2f}"
        f"L{xr:.2f},{y_pap:.2f}"
        f"L{xkn_r:.2f},{y_pap:.2f}"
        + _ease(xkn_r, y_pap, xma_r, y_marg, flat_b=False)
        + f"L{xma_l:.2f},{y_marg:.2f}"
        + _rev_ease(xma_l, y_marg, xkn_l, y_pap)
        + f"L{xl:.2f},{y_pap:.2f}Z"
    )


def bone_path(occl: float, cx: float, col_px: float) -> str:
    """The alveolar bone block, ending at the gum's own crest line."""
    y_top = occl - BONE_TOP_H
    y_bot = occl - CREST_H + BONE_OVERLAP
    xl, _, _, _, _, xr = _span(cx, 0.0, col_px)
    return (
        f"M{xl:.2f},{y_top:.2f}"
        f"L{xr:.2f},{y_top:.2f}"
        f"L{xr:.2f},{y_bot:.2f}"
        f"L{xl:.2f},{y_bot:.2f}Z"
    )
