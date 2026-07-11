import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import App from '../App';
import {
  setSecondaryCariesMode,
  setIcdasEnabled,
  setPulpDetailLevel,
  setNotesEnabled,
} from '../odontogram';

// Mock odontogram.ts since it manipulates real DOM and SVGs
vi.mock('../odontogram', () => ({
  initOdontogram: vi.fn().mockResolvedValue(undefined),
  destroyOdontogram: vi.fn(),
  setNumberingSystem: vi.fn(),
  clearSelection: vi.fn(),
  setOcclusalVisible: vi.fn(),
  setWisdomVisible: vi.fn(),
  setShowBase: vi.fn(),
  setHealthyPulpVisible: vi.fn(),
  registerPlugins: vi.fn(),
  setPluginState: vi.fn(),
  getPluginState: vi.fn(),
  getToothStateSummary: vi.fn().mockReturnValue([]),
  setReadOnly: vi.fn(),
  getReadOnly: vi.fn().mockReturnValue(false),
  setNotesEnabled: vi.fn(),
  getNotesEnabled: vi.fn().mockReturnValue(false),
  setIcdasEnabled: vi.fn(),
  getIcdasEnabled: vi.fn().mockReturnValue(false),
  setPulpDetailLevel: vi.fn(),
  getPulpDetailLevel: vi.fn().mockReturnValue('aae'),
  setSecondaryCariesMode: vi.fn(),
  getSecondaryCariesMode: vi.fn().mockReturnValue('standard'),
  setRootCariesMode: vi.fn(),
  getRootCariesMode: vi.fn().mockReturnValue('simple'),
  setRadiographicDepthMode: vi.fn(),
  getRadiographicDepthMode: vi.fn().mockReturnValue('off'),
  setCariesDepthEnabled: vi.fn(),
  getCariesDepthEnabled: vi.fn().mockReturnValue(true),
  getOdontogramSummary: vi.fn().mockReturnValue({
    overview: '', permanentList: null, missingList: null,
    sections: [], implants: null, periodontalTitle: '', periodontalText: '',
  }),
  onStateChange: vi.fn().mockReturnValue(() => {}),
  exportFhir: vi.fn(),
  exportImage: vi.fn(),
  exportSvg: vi.fn(),
  setImportFormat: vi.fn(),
}));

describe('App.tsx', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  describe('standalone mode (no props)', () => {
    it('renders without crashing', () => {
      render(<App />);
      // The app title should be visible (multiple elements may match)
      const elements = screen.getAllByText(/odontogram/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('renders the topbar with export/import buttons', () => {
      render(<App />);
      const exportBtn = document.getElementById('btnStatusExport');
      const importInput = document.getElementById('statusImportInput');
      expect(exportBtn).toBeInTheDocument();
      expect(importInput).toBeInTheDocument();
    });

    it('renders the tooth grid container', () => {
      render(<App />);
      const grid = document.getElementById('toothGrid');
      expect(grid).toBeInTheDocument();
    });

    it('renders the panel with control sections', () => {
      render(<App />);
      const statusCard = document.getElementById('statusCard');
      expect(statusCard).toBeInTheDocument();
    });

    // SP3b Task 6: crown-leakage toggle row. `wireControls`/`syncControlsFromState`
    // (odontogram.ts, mocked out here) own the actual show/hide + state-write
    // behavior — see src/__tests__/crown-leakage.test.ts and warnings.test.ts for
    // that. This only pins down that the row + checkbox exist in the DOM and
    // start hidden (matching every other conditionally-shown row, e.g. calculusRow).
    it('renders the crown-leakage toggle row, hidden by default', () => {
      render(<App />);
      const row = document.getElementById('crownLeakageRow');
      const checkbox = document.getElementById('crownLeakage');
      expect(row).toBeInTheDocument();
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(row).toHaveClass('hidden');
    });

    // SP5 Task 5: the per-tooth root-caries picker lives in the caries card.
    // (initOdontogram is mocked, so the <select> renders empty; this pins the
    // row + select markup, mirroring the crown-leakage row test above.)
    it('renders the root-caries picker row inside the caries card', () => {
      render(<App />);
      const row = document.getElementById('rootCariesRow');
      const select = document.getElementById('rootCariesSelect');
      expect(row).toBeInTheDocument();
      expect(select).toBeInTheDocument();
      expect(select?.tagName).toBe('SELECT');
    });

    it('renders chart action buttons', () => {
      render(<App />);
      expect(document.getElementById('btnOcclView')).toBeInTheDocument();
      expect(document.getElementById('btnWisdomVisible')).toBeInTheDocument();
      expect(document.getElementById('btnBoneVisible')).toBeInTheDocument();
      expect(document.getElementById('btnPulpVisible')).toBeInTheDocument();
      expect(document.getElementById('btnSelectNoneChart')).toBeInTheDocument();
    });
  });

  describe('controlled language mode', () => {
    it('uses the provided language', () => {
      const onLangChange = vi.fn();
      render(<App language="en" onLanguageChange={onLangChange} />);
      // The title is a language-independent product name; verify the language via
      // the dynamic subtitle's language clause instead.
      expect(screen.getByText(/in english/i)).toBeInTheDocument();
    });

    it('calls onLanguageChange when language is selected', async () => {
      const onLangChange = vi.fn();
      render(<App language="en" onLanguageChange={onLangChange} />);

      // Open language dropdown (now an icon button identified by its aria-label)
      const langButton = screen.getByRole('button', { name: /Language/i });
      fireEvent.click(langButton);

      // Click on Hungarian option (text includes flag emoji)
      await waitFor(() => {
        const huOption = screen.getByRole('menuitemradio', { name: /Hungarian/i });
        fireEvent.click(huOption);
      });

      expect(onLangChange).toHaveBeenCalledWith('hu');
    });
  });

  describe('controlled numbering mode', () => {
    it('uses the provided numbering system', () => {
      const onNumberingChange = vi.fn();
      render(<App language="en" numberingSystem="UNIVERSAL" onNumberingChange={onNumberingChange} />);
      // Numbering now lives inside the Settings modal (General tab); open it first
      fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
      const select = screen.getByLabelText('Numbering') as HTMLSelectElement;
      expect(select.value).toBe('UNIVERSAL');
    });

    it('calls onNumberingChange when numbering is selected', () => {
      const onNumberingChange = vi.fn();
      render(<App language="en" numberingSystem="FDI" onNumberingChange={onNumberingChange} />);

      // Numbering now lives inside the Settings modal (General tab); open it first
      fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
      const select = screen.getByLabelText('Numbering') as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'PALMER' } });

      expect(onNumberingChange).toHaveBeenCalledWith('PALMER');
    });
  });

  describe('settings modal', () => {
    const openModal = () => {
      fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
      return screen.getByRole('dialog');
    };

    it('is closed by default and opens from the gear button', () => {
      render(<App language="en" />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      const dialog = openModal();
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('moves focus into the dialog when opened (focus trap)', () => {
      render(<App language="en" />);
      const dialog = openModal();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it('closes on Escape', () => {
      render(<App language="en" />);
      const dialog = openModal();
      fireEvent.keyDown(dialog, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes on backdrop click', () => {
      render(<App language="en" />);
      openModal();
      const backdrop = document.querySelector('.odon-settings-backdrop') as HTMLElement;
      fireEvent.mouseDown(backdrop);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders every tab and switches between them', () => {
      render(<App language="en" />);
      openModal();
      const tabNames = ['General', 'Secondary caries', 'Caries', 'Pulp', 'Notes'];
      for (const name of tabNames) {
        const tab = screen.getByRole('tab', { name });
        fireEvent.click(tab);
        expect(tab).toHaveAttribute('aria-selected', 'true');
        // The active panel has content
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();
      }
    });

    it('General tab exposes numbering, language and theme controls', () => {
      render(<App language="en" />);
      const dialog = openModal();
      // Scope to the dialog: the topbar keeps its own separate Language button.
      expect(within(dialog).getByLabelText('Numbering')).toBeInTheDocument();
      expect(within(dialog).getByLabelText('Language')).toBeInTheDocument();
      expect(within(dialog).getByLabelText('Appearance')).toBeInTheDocument();
    });

    it('changing the secondary-caries mode calls setSecondaryCariesMode', () => {
      render(<App language="en" />);
      openModal();
      fireEvent.click(screen.getByRole('tab', { name: 'Secondary caries' }));
      const panel = screen.getByRole('tabpanel');
      const select = within(panel).getByLabelText(/Secondary caries/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'full' } });
      expect(setSecondaryCariesMode).toHaveBeenCalledWith('full');
    });

    it('toggling ICDAS on the Caries tab calls setIcdasEnabled', () => {
      render(<App language="en" />);
      openModal();
      fireEvent.click(screen.getByRole('tab', { name: 'Caries' }));
      const panel = screen.getByRole('tabpanel');
      const toggle = within(panel).getByLabelText('ICDAS') as HTMLInputElement;
      fireEvent.click(toggle);
      expect(setIcdasEnabled).toHaveBeenCalledWith(true);
    });

    it('changing pulp detail level calls setPulpDetailLevel', () => {
      render(<App language="en" />);
      openModal();
      fireEvent.click(screen.getByRole('tab', { name: 'Pulp' }));
      const select = screen.getByLabelText(/Pulp detail/i) as HTMLSelectElement;
      fireEvent.change(select, { target: { value: 'latin' } });
      expect(setPulpDetailLevel).toHaveBeenCalledWith('latin');
    });

    it('toggling notes on the Notes tab calls setNotesEnabled', () => {
      render(<App language="en" />);
      openModal();
      fireEvent.click(screen.getByRole('tab', { name: 'Notes' }));
      const panel = screen.getByRole('tabpanel');
      const toggle = within(panel).getByLabelText('Notes') as HTMLInputElement;
      fireEvent.click(toggle);
      expect(setNotesEnabled).toHaveBeenCalledWith(true);
    });
  });

  describe('dark mode', () => {
    it('toggles dark mode when theme button is clicked (standalone)', () => {
      render(<App />);
      // Multiple icon buttons share .btn-theme now; target the dark-mode toggle
      // by its accessible label (light mode shows the "Dark mode" label).
      const themeBtn = screen.getByRole('button', { name: /Dark mode/i }) as HTMLElement;
      expect(themeBtn).toBeInTheDocument();

      // Initially light mode
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      fireEvent.click(themeBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      fireEvent.click(themeBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('calls onDarkModeChange in controlled mode', () => {
      const onDarkChange = vi.fn();
      render(<App darkMode={false} onDarkModeChange={onDarkChange} />);

      const themeBtn = screen.getByRole('button', { name: /Dark mode/i }) as HTMLElement;
      fireEvent.click(themeBtn);

      expect(onDarkChange).toHaveBeenCalledWith(true);
    });

    it('respects darkMode prop', () => {
      render(<App darkMode={true} />);
      // In controlled mode, the button should show sun icon (switch to light)
      const sunIcon = document.querySelector('.btn-theme svg circle');
      expect(sunIcon).toBeInTheDocument();
    });
  });

  describe('selection actions', () => {
    it('renders all selection action buttons', () => {
      render(<App />);
      expect(document.getElementById('btnSelectAll')).toBeInTheDocument();
      expect(document.getElementById('btnSelectNone')).toBeInTheDocument();
      expect(document.getElementById('btnSelectUpper')).toBeInTheDocument();
      expect(document.getElementById('btnSelectLower')).toBeInTheDocument();
    });

    it('renders status action buttons', () => {
      render(<App />);
      expect(document.getElementById('btnResetAll')).toBeInTheDocument();
      expect(document.getElementById('btnPrimaryDentition')).toBeInTheDocument();
      expect(document.getElementById('btnMixedDentition')).toBeInTheDocument();
      expect(document.getElementById('btnEdentulous')).toBeInTheDocument();
    });
  });

  describe('tooth control sections', () => {
    it('renders tooth select dropdown', () => {
      render(<App />);
      expect(document.getElementById('toothSelect')).toBeInTheDocument();
    });

    it('renders restoration + substrate select dropdowns', () => {
      render(<App />);
      expect(document.getElementById('restorationSelect')).toBeInTheDocument();
      expect(document.getElementById('substrateSelect')).toBeInTheDocument();
    });

    // SP7 Task 4: #endoSelect/#pulpSelect were merged into one #pulpEndoSelect
    // (two optgroups, populated dynamically by odontogram.ts — mocked out here,
    // see sp7-pulp-endo-select.test.ts for the populated/behavioral coverage).
    it('renders the merged pulp/endo select dropdown, not the old separate ones', () => {
      render(<App />);
      expect(document.getElementById('pulpEndoSelect')).toBeInTheDocument();
      expect(document.getElementById('endoSelect')).not.toBeInTheDocument();
      expect(document.getElementById('pulpSelect')).not.toBeInTheDocument();
    });

    it('renders filling select dropdown', () => {
      render(<App />);
      expect(document.getElementById('fillingSelect')).toBeInTheDocument();
    });

    it('renders mobility select dropdown', () => {
      render(<App />);
      expect(document.getElementById('mobilitySelect')).toBeInTheDocument();
    });
  });
});
