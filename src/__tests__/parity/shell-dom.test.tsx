// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Shell DOM-parity harness.
//
// Freezes the markup `OdontogramShell` renders, so the composable-UI refactor
// (design/composable-ui.md) can prove that extracting the shell's JSX into
// separately-placeable surface components leaves the DEFAULT composition
// byte-identical. This is the objective contract behind constraint #2 of that
// document — "the default composition renders a byte-identical DOM".
//
// The engine's two DOM-mutating lifecycle calls (`initOdontogram` /
// `destroyOdontogram`) are stubbed so the snapshot captures ONLY the shell's own
// JSX: `#toothGrid` stays empty and the grid's SVG content — already covered by
// the SVG-fingerprint fixtures in this directory — never enters this snapshot.
// Everything else in `odontogram.ts` stays real, so the captured markup reflects
// genuine getter values rather than hand-written mock returns.
//
// Re-capture with `npm run parity:capture` (sets PARITY_CAPTURE) after an
// INTENTIONAL shell markup change; the guarded capture below never runs in the
// normal suite, so the golden is not re-frozen by accident.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import App from "../../App";

vi.mock("../../odontogram", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../odontogram")>();
  return {
    ...actual,
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
  };
});

const GOLDEN_PATH = path.resolve(__dirname, "shell-dom-golden.html");

/**
 * Collapse the bundle-inlined assets (base64 brand logo, `?raw` icon SVGs
 * carried on `data-icon-src`) to a short placeholder.
 *
 * They are static build artifacts, not layout: leaving them in makes the golden
 * ~130 KB of unreadable base64, which would defeat the purpose of a fixture
 * whose whole job is to make an unintended markup change VISIBLE in a diff.
 * Structure, ids, classes and attribute order — everything the composability
 * refactor could plausibly disturb — are preserved verbatim.
 */
function normalizeInlinedAssets(html: string): string {
  return html
    .replace(/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/g, "data:<inlined-image>")
    .replace(/data-icon-src="[^"]{200,}"/g, 'data-icon-src="<inlined-svg>"');
}

/** Render the default shell composition and return its normalized markup. */
function renderShellMarkup(): string {
  const { container } = render(<App />);
  return normalizeInlinedAssets(container.innerHTML);
}

describe("shell DOM parity", () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
  });

  // Guarded exactly like capture.test.ts: only `npm run parity:capture` writes.
  it.skipIf(!process.env.PARITY_CAPTURE)("capture frozen shell-DOM fixture (one-time)", () => {
    writeFileSync(GOLDEN_PATH, renderShellMarkup(), "utf-8");
  });

  it.skipIf(!!process.env.PARITY_CAPTURE)("default composition matches the frozen shell DOM", () => {
    expect(existsSync(GOLDEN_PATH)).toBe(true);
    const golden = readFileSync(GOLDEN_PATH, "utf-8");
    expect(renderShellMarkup()).toBe(golden);
  });

  it.skipIf(!!process.env.PARITY_CAPTURE)("is deterministic across renders", () => {
    const first = renderShellMarkup();
    cleanup();
    const second = renderShellMarkup();
    expect(second).toBe(first);
  });
});
