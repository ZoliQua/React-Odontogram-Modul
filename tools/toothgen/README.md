# Tooth template generator

This toolchain preserves Dirk Saeger's literature-referenced nine-template
anatomy while deriving every registered clinical SVG layer from four canonical
source drawings.

## Anatomical contract

`spec.py` records the relative total length, root fraction, crown-width ratio,
root count, furcation position, FDI assignments, and source figure for each
template. These measurements are the clinical source of truth. The odontogram
uses one documented display transform (`ROOT_DISPLAY_SCALE`) to shorten the
apical region while retaining the relative dimensions between tooth classes.
The periodontal chart restores measured root length around the generated CEJ.

The nine templates are:

- `11`: upper central incisor
- `12`: upper lateral incisor
- `31`: lower incisors
- `13`: canines
- `14`: two-rooted upper first premolars
- `15`: single-rooted upper second and lower premolars
- `16`: three-rooted upper first molars
- `17`: more convergent three-rooted upper second and third molars
- `46`: two-rooted lower molars

## Generation model

`build.py` applies one coordinate transformation to the entire source SVG so
caries, restorations, pulp, periodontal artwork, implants, tissue layers, and
plan overlays remain registered with the tooth contour. The vertical mapping
is piecewise affine: root and crown regions have their own factors, connected
through a narrow smoothstep transition around the CEJ. Crown height remains
unchanged by default.

`roots.py` handles topology changes before the common transform. A
single-rooted premolar receives a continuous canine-derived taper instead of
two roots being pushed together. Upper molars receive a palatal root woven into
contour layers and added as a separate lumen in endodontic layers. This avoids
seams, cervical steps, and detached root silhouettes.

Every generated template has its own paint-server namespace. Clinical layer
ids deliberately remain identical across templates because the renderer uses
them as its activation contract.

## Verification

Run all Python commands through `uv`:

```bash
uv run tools/toothgen/build.py
uv run tools/toothgen/verify.py
uv run tools/toothgen/check_roundtrip.py
```

`verify.py` checks XML validity, root topology and ratios, clinical id/tag
parity, the common occlusal plane, and frozen SHA-256 digests of every
geometry-bearing attribute outside `defs`. Those digests were captured from
Dirk's authored branch and prevent technical maintenance from silently changing
his contours, proportions, or registered clinical artwork.

`check_roundtrip.py` independently verifies that parsing and identity
serialization preserve every path within tolerance. Running `build.py` twice
must produce byte-identical SVG assets.
