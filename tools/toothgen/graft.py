"""Graft a drawn root from one source template onto the crown of another.

Template 15, the single-rooted premolar, was produced by redrawing the two roots
of source 14 as one. That conversion is what put the reported defects into the
asset: a step where the new root was butt-joined at a single height, and the
walls of the two old canals surviving above that joint (odontogram-ay4).

Source 13 already contains what the conversion was trying to synthesise - a
genuinely single root, drawn, with one canal, its own contour and its own lumen
layers. Grafting it removes both defects by construction rather than by
correction, and it also supplies a DRAWN cervical transition, which is where the
kink Dirk reported actually lives.

The graft is per layer and keeps source 14's element and id order intact, so the
generated template still matches its source id for id and the SVG parity
fingerprint is untouched. Only `d` attributes change.
"""

from __future__ import annotations

import re

import roots
import svgpath

# Layers whose two premolar copies exist because the source has two ROOTS. The
# crown keeps both - a premolar has two cusps and therefore two pulp horns - and
# only the deep one receives the canal. Nothing is emptied and no id disappears.
TWIN_LUMEN_DEEP = ("tooth-healthy-pulp-2", "tooth-inflam-pulp-base-2")
TWIN_LUMEN_SHALLOW = ("tooth-healthy-pulp-1", "tooth-inflam-pulp-base-1")
TWIN_LUMEN_DONOR = {
    "tooth-healthy-pulp-2": "tooth-healthy-pulp",
    "tooth-inflam-pulp-base-2": "tooth-inflam-pulp-base1",
}

# One root still has a mesial and a distal surface, so both markers stay; the
# donor's single shape is placed on each side of the new root.
TWIN_SURFACE_DONOR = {
    "endo-resorption-distal": ("endo-resorption", False),
    "endo-resorption-mesial": ("endo-resorption", True),
}

# An implant is a fixture, not a root, and the bone around it follows the
# fixture rather than an anatomical apex. These layers keep the host's own
# drawing, which also leaves the template's IMPLANT_CEJ_Y anchor where it was.
NO_GRAFT = ("implant", "peri-implant")

ELEMENT_RE = re.compile(r"<(path|polygon|g|/g)([^>]*?)>")


def _dist(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5


def apical_walk(d: str, y_cut: float):
    """The contour of `d` below `y_cut`, as (entry, exit, points, segs, rest).

    Returns None when the path does not cross `y_cut` exactly twice, or when
    neither walk direction stays apical - the caller then leaves the layer as it
    is rather than guessing.
    """

    segs, rest = roots._contour_of(d)
    if len(segs) < 4:
        return None
    crossings = roots._crossings_of(segs, y_cut)
    if len(crossings) != 2:
        return None
    for c1, c2 in ((crossings[0], crossings[1]), (crossings[1], crossings[0])):
        pts = roots._walk(segs, c1, c2)
        if not pts:
            continue
        if min(p[1] for p in pts) < y_cut - 1.5 and max(p[1] for p in pts) <= y_cut + 0.6:
            return c1, c2, pts, segs, rest
    return None


# The profile stops once the two flanks are this close and the apex is drawn as
# an arc between them instead.
TIP_WIDTH = 0.6


def _tip_arc(near: float, far: float, y: float, apex: float, steps: int = 9):
    """A rounded root tip between the last two flank points."""

    import math

    mid = (near + far) / 2.0
    half = (near - far) / 2.0
    reach = y - apex
    return [
        (
            mid + half * math.cos(math.pi * k / steps),
            y - reach * math.sin(math.pi * k / steps),
        )
        for k in range(1, steps)
    ]


def _sides_at(subs, y: float):
    sp = roots.spans_at(subs, y)
    return (sp[0][0], sp[-1][1]) if sp else None


def _slope_at(subs, y: float, h: float = 0.5):
    a, b = _sides_at(subs, y + h), _sides_at(subs, y - h)
    if a is None or b is None:
        return None
    return ((b[0] - a[0]) / (2 * h), (b[1] - a[1]) / (2 * h))


def find_cut(host_subs, donor_subs, cej: float, reach: float = 4.0, step: float = 0.25):
    """Where to join, chosen as the height whose two directions agree best.

    Joining at the cervical line itself leaves a corner no blend can hide,
    because there the premolar's crown is still flaring apically while the
    canine's root already tapers - two directions meeting at a point. A little
    higher, inside the cervical third, both are still flaring and the graft can
    turn the corner smoothly over the band instead of at one height.
    """

    best, best_y = None, cej
    y = cej
    while y <= cej + reach:
        sh, sd = _slope_at(host_subs, y), _slope_at(donor_subs, y)
        if sh is not None and sd is not None:
            gap = abs(sh[0] - sd[0]) + abs(sh[1] - sd[1])
            if best is None or gap < best:
                best, best_y = gap, y
        y += step
    return best_y


def _smoothstep(t: float) -> float:
    t = min(1.0, max(0.0, t))
    return t * t * (3.0 - 2.0 * t)


def graft_apical(
    d_host: str,
    d_donor: str,
    y_cut: float,
    mapfn,
    band_frac: float = 0.35,
    samples: int = 48,
) -> str | None:
    """Replace the host's geometry below `y_cut` with the donor's.

    Rebuilt from the two contours' SIDE PROFILES rather than by splicing the
    donor's sampled outline in directly. Splicing the outline joins the values
    but not the direction, and it inherits every near-duplicate point the
    sampling produces: the first version of this measured 141 degrees of turn at
    the joint and 180 at the tip, where the drawn canine turns at most 6. A
    profile blended with a smoothstep is continuous in value AND in slope at
    both ends of the band by construction, which is what a kink is the absence
    of.

    Left and right are carried separately, so the donor's root keeps its own
    asymmetry instead of being averaged into a symmetric taper.
    """

    host = apical_walk(d_host, y_cut)
    if host is None:
        return None
    c1, c2, _, segs, rest = host

    host_subs = roots._polylines(d_host)
    donor_subs = roots._polylines(svgpath.warp_path_d(d_donor, mapfn))

    at_cut = _sides_at(host_subs, y_cut)
    host_slope = _slope_at(host_subs, y_cut + 0.75)
    if at_cut is None or host_slope is None:
        return None

    apex = min(p[1] for s in donor_subs for p in s)
    depth = y_cut - apex
    if depth < 3.0:
        return None
    # The transition length is measured, not chosen for looks. The two cervices
    # do not match: the premolar's is broad and still flaring apically where the
    # canine's is already tapering sharply, so joining them over a short band
    # leaves a corner no smoothing can hide. Swept over the root, the sharpest
    # turn along the shaft and the width of the cervical quarter run:
    #
    #     20%  13.2 deg   16.7        35%   8.7 deg   17.2
    #     25%  12.0 deg   16.7        40%   9.3 deg   17.6
    #     30%  10.3 deg   16.9        50%   9.3 deg   17.6
    #
    # so a third of the root is not a compromise between the two - it is the
    # smoothest length measured AND slimmer than any longer one. 8.7 degrees is
    # inside the range the DRAWN teeth occupy (lower incisor 3.8, upper incisor
    # 5.5, canine 7.4), and the apical two thirds stay purely the donor's root.
    band = depth * band_frac

    left, right, ys = [], [], []
    for i in range(samples + 1):
        d = depth * i / samples
        y = y_cut - d
        donor_sides = _sides_at(donor_subs, y)
        if donor_sides is None:
            break
        # Smoothstep has zero slope at both ends, so the outline leaves the cut
        # in the host's own direction and arrives in the donor's. Continuous in
        # value AND in direction at both ends of the band - which is what a kink
        # is the absence of.
        e = _smoothstep(d / band) if band > 0 else 1.0
        l = (at_cut[0] - d * host_slope[0]) * (1 - e) + donor_sides[0] * e
        r = (at_cut[1] - d * host_slope[1]) * (1 - e) + donor_sides[1] * e
        # Stop before the sides meet. Running the profile into the apex makes
        # the two flanks collide in a single point, which is a spike, not a root
        # tip - it measured 84 degrees of turn where a drawn root turns at 6.
        if r - l < TIP_WIDTH and ys:
            break
        left.append(l)
        right.append(r)
        ys.append(y)

    if len(ys) < 6:
        return None

    pa, pb = c1[2], c2[2]
    left_first = pa[0] < pb[0]
    near = left if left_first else right
    far = right if left_first else left

    pts = [(near[i], ys[i]) for i in range(len(ys))]
    pts += _tip_arc(near[-1], far[-1], ys[-1], apex)
    pts += [(far[i], ys[i]) for i in range(len(ys) - 1, -1, -1)]
    pts[0], pts[-1] = pa, pb
    return roots._splice(segs, c1, c2, roots._catmull_cubics(pts), rest)


def _clip_halfplane(sub, y_cut: float, keep_above: bool):
    """Sutherland-Hodgman against one horizontal edge."""

    def inside(p):
        return p[1] >= y_cut if keep_above else p[1] <= y_cut

    out = []
    n = len(sub)
    for i in range(n):
        a, b = sub[i], sub[(i + 1) % n]
        ia, ib = inside(a), inside(b)
        if ia:
            out.append(a)
        if ia != ib and abs(b[1] - a[1]) > 1e-12:
            t = (y_cut - a[1]) / (b[1] - a[1])
            out.append((a[0] + t * (b[0] - a[0]), y_cut))
    return out


def _polygons_to_d(polys) -> str:
    parts = []
    for poly in polys:
        if len(poly) < 3:
            continue
        head = f"M{poly[0][0]:.2f},{poly[0][1]:.2f}"
        body = "".join(f"L{x:.2f},{y:.2f}" for x, y in poly[1:])
        parts.append(head + body + "Z")
    return "".join(parts)


def clip_graft(d_host: str, d_donor: str | None, y_cut: float, mapfn) -> str | None:
    """Keep the host above `y_cut`, take the donor below it.

    The fallback for every layer the contour splice cannot handle - anything
    that crosses the cervical line more than twice, which is exactly what a pair
    of canals does. It butt-joins at one height, but for a lumen that joint lies
    inside the pulp chamber where nothing shows, and it removes a twin structure
    by construction: below the cut only the donor's single shape exists.
    """

    above = [_clip_halfplane(s, y_cut, True) for s in roots._polylines(d_host)]
    below = []
    if d_donor is not None:
        mapped = svgpath.warp_path_d(d_donor, mapfn)
        below = [_clip_halfplane(s, y_cut, False) for s in roots._polylines(mapped)]
    out = _polygons_to_d([p for p in above + below if len(p) >= 3])
    return out or None


def layer_index(txt: str) -> dict[str, str]:
    """Map a layer key to its `d`. Elements without an id of their own are keyed
    by their enclosing group and their position in it, so the two structurally
    parallel sources line up."""

    out: dict[str, str] = {}
    stack: list[str] = []
    counts: dict[str, int] = {}

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if not attrs.rstrip().endswith("/"):
                idm = re.search(r'\sid="([^"]+)"', attrs)
                stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)
        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        if idm:
            key = idm.group(1)
        else:
            group = stack[-1] if stack else ""
            counts[group] = counts.get(group, 0) + 1
            key = f"{group}#{counts[group]}"
        out.setdefault(key, dm.group(1))
        return m.group(0)

    ELEMENT_RE.sub(repl, re.sub(r"<defs>.*?</defs>", "", txt, flags=re.S))
    return out


def _contour_metrics(txt: str, cej: float):
    from build import silhouette_width, tooth_base_d

    d = tooth_base_d(txt)
    pts = [p for sub in roots._polylines(d) for p in sub]
    xs = [p[0] for p in pts]
    return (min(xs) + max(xs)) / 2.0, silhouette_width(d, cej), min(p[1] for p in pts)


def build_map(host_txt: str, donor_txt: str, cej_host: float, cej_donor: float):
    """The affine that carries the donor's root into the host's frame.

    Widths are matched AT THE CERVICAL LINE, which is what makes the joint
    continuous, and the root length is scaled to the host's, so the graft keeps
    the premolar's proportion and only takes the canine's shape.
    """

    cx_h, w_h, apex_h = _contour_metrics(host_txt, cej_host)
    cx_d, w_d, apex_d = _contour_metrics(donor_txt, cej_donor)
    sx = w_h / w_d
    sy = (cej_host - apex_h) / (cej_donor - apex_d)

    def fn(x: float, y: float):
        return (cx_h + (x - cx_d) * sx, cej_host + (y - cej_donor) * sy)

    def mirror(x: float, y: float):
        nx, ny = fn(x, y)
        return (2 * cx_h - nx, ny)

    return fn, mirror


def graft_root(
    host_txt: str,
    donor_txt: str,
    cej_host: float,
    cej_donor: float,
):
    """Rewrite every root-bearing layer of `host_txt` from `donor_txt`."""

    donor = layer_index(donor_txt)
    fn, mirror = build_map(host_txt, donor_txt, cej_host, cej_donor)

    grafted: list[str] = []
    closed: list[str] = []
    skipped: list[str] = []

    stack: list[str] = []
    counts: dict[str, int] = {}

    def repl(m):
        head, attrs = m.group(1), m.group(2)
        if head == "g":
            if not attrs.rstrip().endswith("/"):
                idm = re.search(r'\sid="([^"]+)"', attrs)
                stack.append(idm.group(1) if idm else "")
            return m.group(0)
        if head == "/g":
            if stack:
                stack.pop()
            return m.group(0)

        dm = re.search(r'\sd="([^"]+)"', attrs)
        if not dm:
            return m.group(0)
        idm = re.search(r'\sid="([^"]+)"', attrs)
        if idm:
            key = idm.group(1)
        else:
            group = stack[-1] if stack else ""
            counts[group] = counts.get(group, 0) + 1
            key = f"{group}#{counts[group]}"

        if key.startswith(NO_GRAFT) or (stack and stack[-1].startswith(NO_GRAFT)):
            return m.group(0)

        d = dm.group(1)
        pts = [p for sub in roots._polylines(d) for p in sub]
        if not pts:
            return m.group(0)
        if min(p[1] for p in pts) > cej_host - 1.0:
            return m.group(0)  # crown-only: nothing of it is root

        if key in TWIN_LUMEN_SHALLOW:
            # The premolar's second horn stays; its second canal does not.
            out = clip_graft(d, None, cej_host, fn)
            if out is not None:
                closed.append(key)
            else:
                skipped.append(key)
                return m.group(0)
        else:
            donor_key, flip = key, False
            if key in TWIN_LUMEN_DONOR:
                donor_key = TWIN_LUMEN_DONOR[key]
            elif key in TWIN_SURFACE_DONOR:
                donor_key, flip = TWIN_SURFACE_DONOR[key]
            d_donor = donor.get(donor_key)
            if d_donor is None:
                skipped.append(key)
                return m.group(0)
            mapping = mirror if flip else fn

            if max(p[1] for p in pts) <= cej_host + 0.5:
                # Root-only: nothing of the host belongs to the crown, so the
                # donor's layer replaces it outright.
                out = svgpath.warp_path_d(d_donor, mapping)
                grafted.append(key)
            else:
                out = graft_apical(d, d_donor, cej_host, mapping)
                if out is not None:
                    grafted.append(key)
                else:
                    out = clip_graft(d, d_donor, cej_host, mapping)
                    if out is None:
                        skipped.append(key)
                        return m.group(0)
                    closed.append(key)
        attrs2 = attrs.replace(dm.group(0), f' d="{out}"', 1)
        return f"<{head}{attrs2}>"

    body = ELEMENT_RE.sub(repl, host_txt)
    return body, grafted, closed, skipped
