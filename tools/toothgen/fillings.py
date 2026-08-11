"""Make a proximal filling reach the occlusal one, so MO/OD/MOD is one shape.

Each surface is its own layer and its own authored shape, and the shapes were
drawn independently: charting MOD lights three of them and the chart shows
three separate blobs with tooth between them. Measured, every adjacent pair on
every side template and every material was TWO connected regions - not a seam
that overlaps too little, but shapes that miss each other entirely. Their
bounding boxes do overlap by a unit or so; the shapes inside them do not,
because the band's edge dips away exactly where the proximal shape stops.

The fix is the one the cavity itself gives: a proximal box on a posterior tooth
is cut THROUGH the occlusal surface, and a mesial plus incisal restoration on an
anterior tooth is a class IV, which is also one restoration. So the proximal
shape is stretched toward the occlusal band until it runs into it - anchored at
its far end, which on a side view is the floor of the box and must not move.

The stretch also follows the TOOTH. A point moved toward the occlusal edge is
scaled about the crown's centreline by how much the crown has narrowed there.
Without that a proximal filling grows straight past the contour - on the canine,
whose crown tapers hard to the cusp tip, by five units of material drawn outside
the tooth. With it the overhang is what it always was, to within a tenth of a
unit on every template.

Both views are handled, and they differ only in which axis the box grows along:
on the side view a proximal box grows occlusally (+y, the crown being drawn
below the cervix), on the occlusal view it grows toward the middle of the tooth
(-x for mesial, +x for distal). That is the whole difference, so it is one
parameter rather than two functions.

Only mesial and distal are joined to the occlusal. The buccal shape is left
alone: an occlusal filling and a buccal one are as often two restorations as
one, and nothing in the chart says which - a question for the dentist, not a
default.
"""

from __future__ import annotations

import roots
import svgpath


# How far the proximal shape reaches PAST the occlusal band's near edge, in
# template units. Enough that the union is one region with a shared boundary
# rather than two shapes touching at a point, which is what a seam looks like
# once the renderer antialiases it.
OVERLAP = 1.6

# Never let the stretched shape reach closer than this to the far edge of the
# tooth, so a filling cannot grow out through the cusp tips.
EDGE_KEEP = 1.0

SURFACES = ("mesial", "distal")
MATERIALS = ("amalgam", "composite", "gic", "temporary")


def _uv(axis: str, sign: float):
    """Map between drawing coordinates and (u, v), u growing toward the band."""
    if axis == "y":
        return (lambda x, y: (sign * y, x)), (lambda u, v: (v, sign * u))
    return (lambda x, y: (sign * x, y)), (lambda u, v: (sign * u, v))


def _edge(subs, v: float, to_uv, far: bool):
    """The largest (far) or smallest u the outline reaches at ordinate ``v``."""
    us = []
    for sub in subs:
        for pa, pb in zip(sub, sub[1:]):
            ua, va = to_uv(*pa)
            ub, vb = to_uv(*pb)
            if (va <= v < vb) or (vb <= v < va):
                t = (v - va) / (vb - va)
                us.append(ua + t * (ub - ua))
    if not us:
        return None
    return max(us) if far else min(us)


def _vertical(d: str, x: float) -> list[float]:
    """Sorted y where the outline of ``d`` crosses the vertical line ``x``."""
    ys = []
    for sub in roots._polylines(d):
        for (ax, ay), (bx, by) in zip(sub, sub[1:]):
            if (ax <= x < bx) or (bx <= x < ax):
                t = (x - ax) / (bx - ax)
                ys.append(ay + t * (by - ay))
    ys.sort()
    return ys


def stretch_to_band(
    shape_d: str,
    band_d: str,
    edge: float,
    base_d: str | None = None,
    axis: str = "y",
    sign: float = 1.0,
) -> str | None:
    """Stretch ``shape_d`` toward ``band_d`` until the two overlap.

    ``edge`` is the tooth's far edge along the stretch axis, in drawing
    coordinates; the stretch is capped short of it. Returns None when the two
    shapes share no ordinate range, which is the case for a shape the band
    never runs alongside.
    """
    to_uv, from_uv = _uv(axis, sign)
    s_subs = roots._polylines(shape_d)
    b_subs = roots._polylines(band_d)
    s_uv = [to_uv(*p) for sub in s_subs for p in sub]
    b_uv = [to_uv(*p) for sub in b_subs for p in sub]

    lo = max(min(v for _, v in s_uv), min(v for _, v in b_uv))
    hi = min(max(v for _, v in s_uv), max(v for _, v in b_uv))
    if hi - lo <= 0.5:
        return None

    u_anchor = min(u for u, _ in s_uv)

    # Where the two come closest along the shared ordinate range.
    best = None
    for i in range(41):
        v = lo + (hi - lo) * i / 40
        s_far = _edge(s_subs, v, to_uv, far=True)
        b_near = _edge(b_subs, v, to_uv, far=False)
        if s_far is None or b_near is None:
            continue
        clearance = b_near - s_far
        if best is None or clearance < best[0]:
            best = (clearance, s_far)
    if best is None:
        return None

    clearance, s_far_at = best
    reach = clearance + OVERLAP
    if reach <= 0:
        return shape_d  # already inside the band

    span = s_far_at - u_anchor
    if span <= 0:
        return shape_d
    k = 1.0 + reach / span

    u_end = max(u for u, _ in s_uv)
    limit = sign * edge - EDGE_KEEP
    if u_anchor + (u_end - u_anchor) * k > limit:
        k = (limit - u_anchor) / (u_end - u_anchor)
    if k <= 1.0:
        return shape_d

    def profile(u: float):
        """Centre and half extent of the tooth ACROSS the axis, at ``u``."""
        if base_d is None:
            return None
        x, y = from_uv(u, 0.0)
        cut = roots.crossings_at(base_d, y) if axis == "y" else _vertical(base_d, x)
        if not cut or len(cut) < 2 or cut[-1] - cut[0] < 1e-6:
            return None
        return (cut[0] + cut[-1]) / 2.0, (cut[-1] - cut[0]) / 2.0

    def warp(x: float, y: float):
        u, v = to_uv(x, y)
        nu = u_anchor + (u - u_anchor) * k
        a, b = profile(u), profile(nu)
        if a is None or b is None:
            return from_uv(nu, v)
        return from_uv(nu, b[0] + (v - a[0]) * (b[1] / a[1]))

    return svgpath.warp_path_d(shape_d, warp)
