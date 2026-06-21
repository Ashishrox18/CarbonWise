# Accessibility

## Target Standard: WCAG 2.1 AA

## Implementation Checklist

| Criterion | Implementation |
|---|---|
| Skip navigation | `<a href="#main-content" class="skip-link">` in layout |
| Page language | `<html lang="en">` |
| Focus visible | 2px brand-green ring via `:focus-visible` |
| ARIA landmarks | `<main id="main-content">`, `<nav aria-label>`, `<header>` |
| Form labels | `<fieldset>` + `<legend>` on all option groups |
| Button state | `aria-pressed` on toggle-style options |
| Progress tracking | `role="progressbar"` with `aria-valuenow/min/max` |
| Live regions | `aria-live="polite"` on toast container |
| Error messages | `role="alert"` on inline errors |
| Images/icons | `aria-hidden="true"` on decorative icons, `aria-label` on SVGs |
| Reduced motion | CSS `@media (prefers-reduced-motion: reduce)` disables all animations |
| Colour contrast | Brand green (#22c55e) on white: 3.1:1 (AA for large text) |
| Keyboard nav | Full Tab/Enter/Space support on all interactive elements |
| Responsive | Mobile-first responsive layout, tested on iPhone 14 via Playwright |

## Testing

Automated accessibility checks run via Playwright E2E tests (skip link, ARIA landmark presence).
Full manual testing with VoiceOver and NVDA is recommended before production deployment.
