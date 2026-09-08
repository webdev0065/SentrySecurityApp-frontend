# Sentry Security App UI and UX Standards

Apply these rules to every new screen, component, and update unless the user explicitly overrides them.

## Design system

- Use the shared color, typography, spacing, and dimension tokens in `src/styles/`.
- Do not introduce arbitrary font sizes, weights, colors, radii, spacing, or shadows when an existing token or established pattern can be reused.
- Keep headings, body text, labels, inputs, placeholders, buttons, cards, tabs, navigation items, and errors visually consistent.
- Preserve the Sentry brand: navy primary color, accessible contrast, clear hierarchy, and a professional security-app interface.

## Typography

- Use one consistent font family throughout the application.
- Reuse the established type scale and weights for display titles, screen titles, section titles, form labels, body text, captions, buttons, and tabs.
- Never translate, rewrite, or otherwise alter user-entered or API-provided data unless the user explicitly requests it.

## Interaction and motion

- Give interactive controls clear mobile-friendly pressed feedback, including buttons, cards, tabs, icons, dropdown rows, and list items.
- Prefer subtle, performant motion: press scale or opacity, modal and dropdown fade/slide transitions, success confirmation, and smooth state changes.
- Do not add distracting, slow, excessive, or performance-heavy effects.
- Implement touch feedback rather than mouse hover behavior for the mobile app.

## Dropdowns

- Open dropdowns as overlays above the existing UI.
- Do not allow an open dropdown to stretch, shift, resize, or enlarge its parent form, modal, or screen.
- Keep the parent layout fixed while only the dropdown appears or disappears.
- Support outside-tap dismissal, an accurate open/close arrow state, scrolling when needed, and reliable selection.

## UX and accessibility

- Provide clear disabled, loading, active, and pressed states for buttons.
- Maintain comfortable mobile touch targets.
- Provide clear loading, success, validation error, empty, and API-error feedback.
- Preserve Android and iOS responsiveness.
- Do not break existing navigation, API integration, authentication, translations, themes, or user data.

## Completion checks

- Reuse or improve shared components rather than duplicate UI logic.
- Keep the implementation aligned with existing screens and applicable Figma references.
- Run TypeScript validation and resolve errors before completion.
- Summarize UI/UX improvements and any limitations in the final handoff.
