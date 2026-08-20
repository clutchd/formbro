# FormBro Design Language

Use this guidance for user-facing UI. Forms themselves should remain neutral enough to feel native when embedded on any website.

## Direction

Combine two distinct qualities:

- **Technical:** monospace typography, uppercase tracking, sharp informational elements, strong borders, and useful density.
- **Modern:** rounded interactions, generous whitespace, a soft palette, and approachable defaults.

The result should feel precise without being cold and approachable without being generic.

## Typography

- Headings use Manrope with bold weight and tight tracking.
- Body copy uses Inter at regular weight for clean readability.
- Technical information, statistics, and metadata use Geist Mono at extra-small sizes with uppercase, widely tracked text.

## Shape and borders

- Use strong, contrasting borders.
- Keep informational and decorative elements sharp: badges, status labels, empty-state icons, and metrics.
- Round interactive elements and containers: buttons, inputs, cards, dialogs, dropdowns, and avatars.
- Never make a clickable element sharp or a purely informational element rounded.

## Spacing

- Establish hierarchy with whitespace.
- Use generous container padding, typically `p-6` to `p-8`.
- Use tighter spacing, typically `gap-4`, for dense related information.
- Maintain a consistent vertical rhythm, typically `space-y-4`.

## Forms

- Use neutral, standard colors and browser conventions.
- Do not apply FormBro brand colors or custom accents to rendered forms.
- Prefer established web-form behavior over novel controls or configuration.
