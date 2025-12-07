# NexSupply AI - Design System

This document outlines the core components of the NexSupply AI design system.

## 1. Figma Link

-   **Status:** Not available.
-   No Figma link was found in the project. If a design file exists, please add the link here.

## 2. Logo and Brand Assets

-   **Status:** Not found.
-   The logo source files (.svg, .png) were not found in the `web/public` or `web/assets` directories. Please add the location of the logo files here.

## 3. Color Palette

The color palette is defined in [`web/tailwind.config.ts`](web/tailwind.config.ts) using CSS variables.

### Core Colors

| Name          | HSL Variable                | Hex (Example) | Description                               |
| :------------ | :-------------------------- | :------------ | :---------------------------------------- |
| **Primary**   | `hsl(var(--primary))`       | `#00F0FF`     | Main brand color, used for CTAs and highlights. |
| **Secondary** | `hsl(var(--secondary))`     | `#007AFF`     | Secondary brand color, used for accents.  |
| **Accent**    | `hsl(var(--accent))`        | `#FFBF00`     | Used for warnings and special highlights. |
| **Success**   | `hsl(var(--success))`       | `#00FF94`     | Used for success messages and indicators. |
| **Destructive**| `hsl(var(--destructive))`   | -             | Used for error messages and destructive actions. |

### UI & Text Colors

| Name         | HSL Variable               | Hex (Example) | Description                               |
| :----------- | :------------------------- | :------------ | :---------------------------------------- |
| **Background** | `hsl(var(--background))`     | -             | Main page background color.               |
| **Foreground** | `hsl(var(--foreground))`     | -             | Main text color.                          |
| **Surface**    | `hsl(var(--card))`         | `#0A0A0A`     | Card and component background color.      |
| **Border**     | `hsl(var(--border))`       | -             | Standard border color.                    |
| **Subtle Border**| `rgba(255,255,255,0.08)` | -             | Lighter border for subtle divisions.      |
| **Muted**      | `hsl(var(--muted))`        | -             | Muted text and icon color.                |

## 4. Typography

The fonts are defined in [`web/tailwind.config.ts`](web/tailwind.config.ts).

-   **Sans-serif (Primary):** `Inter`
    -   Variable: `--font-inter`
    -   Usage: Used for all primary text, including headings and body copy.
-   **Monospace:** `JetBrains Mono`
    -   Variable: `--font-jetbrains-mono`
    -   Usage: Used for code snippets and numerical data that requires alignment.

If these fonts are hosted locally, the font files should be stored in the `web/public/fonts` directory. If they are loaded from a service like Google Fonts, the import link should be in the main layout file (e.g., `app/layout.tsx`).