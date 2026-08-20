# FormBro Agent Guide

Read the code to understand what's going on, yes even node_modules.

## Mission

FormBro is the open-source form platform for serious workflows.

## Philosophy

We have a few philosophies we should always honor:

### Performance above all else

When in doubt, do the thing that makes the app feel the fastest to use.

- Optimistic updates
- Avoiding waterfalls
- etc.

### Good defaults

Users should expect things to behave well by default. Less config is best.

### Convenience

We should not compromise on simplicity and good ux. We want to be pleasant to use with as little friction as possible.

- Less clicks to get to where you want to go
- Minimize blocking states to let users perform actions asap

### Contribution

Commits should be clear and concise. All changes should be atomic and well-documented. Well-documented can just mean human-readable and human-friendly code.

### Security

We want to make things convenient, but we don't want to be insecure. Be thoughtful about how things are implemented.

## Design Language

The best of two worlds conveyed with two distinct stlyes. An interface that feels **percise** without being cold, and **approachable** without being generic.

- **Technical:** Monospace typography, uppercase tracking, sharp edges, information density, percision and performance.
- **Modern:** Rounded interactive elements, generous whitespace, soft palette, comfort and ease of use for non-technical users.

### Typography

- **Headings**: font display (Manrope) bold, tight tracking
- **Body**: font default (Inter), regular weight, clean and readable
- **Monospace**: font mono (Geist Mono), extra small, uppercase, tracking wide. For technical information, stats, and metadata.

### Borders

- Strong contrasting borders
- Sharp corners for informational and decorative elements (badges, status labels, empty state icons, metrics, etc.)
- Rounded corners for interactive and container elements (buttons, inputs, cards, dialogs, dropdowns, avatars, etc.)
- Never use sharp corners on something the user clicks. Never round an element that just displays information.

### Spacing

- Clear visual hierarchy through spacing
- Generous padding (p-6 to p-8 typical)
- Tight spacing for dense information (gap-4)
- Consistent vertical rhythm (space-y-4)

### Forms

- Colors should be neutral and standard, leveraging browser defaults.
- We explicitly want to opt out of the default color palette and use the "best practices for webforms".
- Forms should feel native on any website. No brand colors, no custom accents.
