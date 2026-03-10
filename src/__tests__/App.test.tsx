import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from '../App';

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
}));

describe('App.tsx', () => {
  beforeEach(() => {
    cleanup();
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
      // The English title should appear
      expect(screen.getByText(/React Odontogram Editor Modul/i)).toBeInTheDocument();
    });

    it('calls onLanguageChange when language is selected', async () => {
      const onLangChange = vi.fn();
      render(<App language="en" onLanguageChange={onLangChange} />);

      // Open language dropdown
      const langButton = screen.getByText(/Language/);
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
      expect(screen.getByText(/Universal/)).toBeInTheDocument();
    });

    it('calls onNumberingChange when numbering is selected', async () => {
      const onNumberingChange = vi.fn();
      render(<App language="en" numberingSystem="FDI" onNumberingChange={onNumberingChange} />);

      // Open numbering dropdown
      const numButton = screen.getByText(/Numbering/);
      fireEvent.click(numButton);

      await waitFor(() => {
        const palmerOption = screen.getByRole('menuitemradio', { name: /Palmer/i });
        fireEvent.click(palmerOption);
      });

      expect(onNumberingChange).toHaveBeenCalledWith('PALMER');
    });
  });

  describe('dark mode', () => {
    it('toggles dark mode when theme button is clicked (standalone)', () => {
      render(<App />);
      const themeBtn = document.querySelector('.btn-theme') as HTMLElement;
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

      const themeBtn = document.querySelector('.btn-theme') as HTMLElement;
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

    it('renders crown select dropdown', () => {
      render(<App />);
      expect(document.getElementById('crownSelect')).toBeInTheDocument();
    });

    it('renders endo select dropdown', () => {
      render(<App />);
      expect(document.getElementById('endoSelect')).toBeInTheDocument();
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
