# ToolsBase design reference

Updated September 24, 2026. This is the single maintained reference for the site's visual design. Use [MAINTENANCE.md](MAINTENANCE.md) for architecture and development procedures, and [TORRENT_TOOLS.md](TORRENT_TOOLS.md) for tool behavior.

## Theme

Preserve the existing light theme. Use white surfaces, dark headings, muted gray descriptions, thin borders, and blue actions. Avoid introducing a separate theme for individual tools.

| Role | Value |
| --- | --- |
| Page and card background | `#ffffff` |
| Subtle panel background | `#fafafa` |
| Heading text | `#18181b` |
| Secondary text | `#52525b` |
| Muted text | `#71717a` |
| Border | `#e4e4e7` |
| Input border | `#d4d4d8` |
| Primary action/focus | `#2563eb` |
| Primary hover | `#1d4ed8` |
| Informational background | `#eff6ff` |

## Typography

Use the inherited site font. Base body text is 16px. Homepage supporting text was increased slightly while keeping the hero compact.

| Homepage element | Desktop | Mobile |
| --- | --- | --- |
| Hero heading | Responsive 28–36px | 30px |
| Hero description | 16px | 17px |
| Search input | 16px | 16px |
| Section heading | 23px | 21px |
| Standard card title | 16px | 16px |
| Featured card title | 18px | 17px |
| Card description | 15px | 15px |
| Category filter / suggested search | 14px | 14px |
| Category badge | 13px | 13px |

Body copy uses approximately 1.7–1.8 line height; headings 1.2–1.5. Use font weight 600 for major headings and card titles. Keep tiny text limited to secondary counters/eyebrows. Existing tool fields use 15px and buttons 14px through `.tool-content`; information pages use 16px body text. Torrent disclaimer headings use 16px and copy 14px.

## Layout and spacing

- Align header, main, and footer to a maximum width of 1184px including 16px side gutters, leaving 1152px for content.
- Keep the homepage hero short: introduction on the left, search on the right, with 24px bottom padding. Do not reintroduce the large illustration or excess vertical whitespace.
- Show featured tools immediately after the hero. Use three desktop columns, stacking compact cards on mobile.
- Give the directory a desktop category sidebar and responsive cards. At 1000px, standard tool cards use two columns; below 700px, filters become a horizontal scroll row; below 380px, tool cards use one column.
- Use 10–12px radii for cards/panels, 7–8px for controls, and 1px borders. Shadows should be subtle and primarily used for hover/focus feedback.
- Keep card spacing consistent: typically 12–16px gaps and 15–22px padding. Workspace panels use 26px padding, reducing to 18px on small screens.

## Shared navigation and page structure

The root layout owns the only header and footer. The header contains the brand, **All tools**, and **About**. There is no dedicated top-level “Torrent tools” shortcut. Torrent tools remain discoverable in the homepage directory, search, category page, and mobile category navigation.

Non-torrent categories use `CategoryDirectory` and `ToolLayout`: breadcrumbs, a consistent tool panel, feedback/share actions, and deterministic related cards. Torrent pages use their shared workspace layout. About, privacy, and contact use the shared information panel. The footer aligns with the main content and stacks on mobile; avoid adding a second footer-like homepage block.

## Torrent disclaimer

`app/torrent/layout.tsx` renders one visible, non-collapsible **Terms of use & educational disclaimer** after the page content on the category page and every torrent tool. Its neutral bordered panel uses `.termsNotice` in `Torrent.module.css`.

The notice states lawful, educational, and open-source data management purposes; restricts use to owned, public-domain, or authorized content; prohibits infringement and unauthorized distribution; and explains responsibility for laws/licenses and limits of tool results. Maintain its wording once in the shared layout, rather than copying it into 16 tool components.

Connected tools retain their specific notices before connection controls, explaining peer visibility, sharing, and technical limitations. The common disclaimer does not replace these operational explanations and does not introduce an acceptance modal or checkbox.

## Accessibility and interaction

Preserve input labels, semantic headings, live status/error messages, and visible blue keyboard focus. Category filter state uses `aria-pressed`; expandable mobile categories use `aria-expanded`. The mobile menu traps focus, closes with Escape, restores focus to its trigger, and is inert when closed. Reduced-motion preferences disable card transitions.

Long hashes, names, and results must wrap or scroll inside their panels rather than widening the page. Keep disabled controls visibly distinct and status messages close to the action. Do not make tool content depend on hover alone.

## Editing and review

Change homepage styling in `app/Home.module.css`, shared tool styling in `ToolLayout.module.css`/`globals.css`, footer styling in `SiteFooter.module.css`, and torrent styling in `Torrent.module.css`. Avoid duplicating page-level overrides when a shared component owns the design.

After visual changes, review desktop and 390px mobile layouts, first-screen tool visibility, long titles, search results/empty state, footer wrapping, keyboard focus, and horizontal overflow. Run relevant lint/typecheck checks. Update this document when design values or shared placement rules change.
