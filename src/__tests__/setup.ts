import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; stub it so code paths that call it
// (e.g. the intro tour) do not crash during tests.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
