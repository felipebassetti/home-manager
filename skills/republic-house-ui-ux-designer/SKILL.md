---
name: republic-house-ui-ux-designer
description: Redesign and refine Republic House product interfaces, UX flows, UI copy, information hierarchy, and operational dashboards for shared-housing workflows. Use when you need to improve or create screens for marketplace browsing, house management, member operations, charges, payments, responsive layouts, or product-level visual consistency in this system.
---

# Republic House UI/UX Designer

Design for an operational product first, not a marketing page.

## Workflow

1. Read the relevant route, component, and CSS before proposing changes.
2. Read `references/product-context.md` when the task touches a new surface or persona.
3. Read `references/ui-principles.md` when reworking layout, density, hierarchy, or tone.
4. Identify the primary user for the screen: visitor, house admin, or resident.
5. Prioritize the one or two actions that user most needs on that screen.
6. Reduce decorative structure before adding new UI.
7. Prefer denser, quieter layouts with clear grouping, predictable actions, and obvious status.
8. Keep the output aligned with the existing Angular structure unless a layout change clearly improves usability.

## Republic House Product Rules

- Treat the app as a workflow tool for housing operations.
- Make house admins efficient first; visitor flows still need to feel trustworthy and easy to scan.
- Prefer page sections, split layouts, tables, lists, and toolbars over hero-style marketing composition.
- Surface operational state early: availability, member count, charge count, payment status, due dates.
- Keep financial information prominent, legible, and comparable.
- Use short direct copy in Portuguese unless the task explicitly asks otherwise.
- Keep forms narrow, structured, and grouped by task.
- Use image assets only where they help users inspect a listing or house.

## Layout Guidance

- Use a stable shell with navigation that supports repeated work.
- Give each page one clear header with title, short supporting line, and nearby actions.
- Keep filters compact and near the content they affect.
- Use two-column layouts for detail and management pages when desktop width allows it.
- Collapse gracefully to one column on tablet and mobile.
- Reserve accent color for actionable states, not large decorative areas.
- Prefer restrained cards only for repeated items, metrics, modals, and clearly bounded tools.

## Interaction Guidance

- Make primary actions obvious and secondary actions visually quieter.
- Show status with labels that can be read quickly in lists and tables.
- Keep empty states specific and actionable.
- Keep feedback messages short and close to the interaction that triggered them.
- Block invalid form submission and show errors in plain language.

## Visual Direction

- Use a calm, professional SaaS tone.
- Prefer neutral surfaces, strong typography contrast, and one disciplined accent color.
- Avoid giant heroes, oversized headlines, and marketing-style spacing.
- Keep radii small, spacing consistent, and tables readable.
- Use image thumbnails with consistent aspect ratios for listings.

## Deliverables

When redesigning a screen:

1. Tighten the information hierarchy.
2. Simplify the visual structure.
3. Improve responsive behavior.
4. Adjust copy to match the operational context.
5. Preserve or improve functional coverage.

