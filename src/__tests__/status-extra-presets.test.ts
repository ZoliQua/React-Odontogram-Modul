import { describe, it, expect, beforeEach } from 'vitest';
import { __setToothStateForTest, __getToothStateForTest, __applyStatusExtraForTest } from '../odontogram';

// The clinical "status extra" presets (span/arch-bridge bridges) used to write
// the now-legacy `crownMaterial` (pillar teeth) and `bridgeUnit` (pontic/gap
// teeth) fields directly with "zircon"/"metal". Task 5 rewrites the FIXED-
// restoration presets to set restorationType/restorationMaterial instead,
// applying the deliberate metal -> metal-ceramic rename. Removable/bar presets
// are untouched (still legacy `bridgeUnit`, owned by SP3b).
describe('clinical status-extra presets (span bridges)', () => {
  beforeEach(() => {
    __setToothStateForTest(12, { toothSelection: 'tooth-base' });
    __setToothStateForTest(11, { toothSelection: 'none' }); // gap/pontic tooth
    __setToothStateForTest(21, { toothSelection: 'tooth-base' });
  });

  it('a zircon span sets the pillar tooth to a crown restoration + bridgePillar flag, not crownMaterial', () => {
    __applyStatusExtraForTest({ type: 'span', teeth: [12, 11, 21], material: 'zircon' });
    const pillar = __getToothStateForTest(12)!;
    expect(pillar.restorationType).toBe('crown');
    expect(pillar.restorationMaterial).toBe('zircon');
    expect(pillar.toothSubstrate).toBe('crownprep');
    expect(pillar.bridgePillar).toBe(true);
    expect(pillar.crownMaterial).toBe('natural');
  });

  it('a zircon span sets the pontic (gap) tooth to a bridge restoration, not bridgeUnit', () => {
    __applyStatusExtraForTest({ type: 'span', teeth: [12, 11, 21], material: 'zircon' });
    const pontic = __getToothStateForTest(11)!;
    expect(pontic.restorationType).toBe('bridge');
    expect(pontic.restorationMaterial).toBe('zircon');
    expect(pontic.bridgeUnit).toBe('none');
  });

  it('a metal span renames the material to metal-ceramic on both pillar and pontic teeth', () => {
    __applyStatusExtraForTest({ type: 'span', teeth: [12, 11, 21], material: 'metal' });
    expect(__getToothStateForTest(12)!.restorationMaterial).toBe('metal-ceramic');
    expect(__getToothStateForTest(11)!.restorationMaterial).toBe('metal-ceramic');
  });

  it('does not touch a tooth-base pillar tooth that was already selected as none', () => {
    __applyStatusExtraForTest({ type: 'span', teeth: [12, 11, 21], material: 'zircon' });
    const other = __getToothStateForTest(21)!;
    expect(other.restorationType).toBe('crown');
    expect(other.bridgePillar).toBe(true);
  });

  it('partial-removable still writes the legacy bridgeUnit field (SP3b territory, untouched)', () => {
    __setToothStateForTest(31, { toothSelection: 'none' });
    __applyStatusExtraForTest({ type: 'partial-removable', arch: 'lower' });
    const s = __getToothStateForTest(31)!;
    expect(s.bridgeUnit).toBe('removable');
    expect(s.restorationType).toBe('none');
  });
});
