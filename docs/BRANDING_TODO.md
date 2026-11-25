# Dastak Branding & Visual Asset TODO

> **Status**: Current assets in `assets/` (`icon.png`, `android-icon-foreground.png`, `splash-icon.png`) are default Expo project placeholders from template initialization (`create-expo-app`). Custom production artwork must be supplied by the project owner before Google Play Store submission.

---

## 1. Required Visual Assets

The project owner must provide the following graphic assets:

| Asset                           | File Destination                     | Dimensions                       | Format / Requirements                                                                                                                    |
| :------------------------------ | :----------------------------------- | :------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **App Store Icon**              | `assets/icon.png`                    | 1024 × 1024 px                   | 32-bit PNG, no alpha/transparency, square. Google Play automatically applies rounded corners.                                            |
| **Adaptive Icon Foreground**    | `assets/android-icon-foreground.png` | 512 × 512 px (or 1024 × 1024 px) | PNG with transparent background. Artwork must stay within the central 66% (340px) safe zone to avoid circular/squircle masking clipping. |
| **Adaptive Icon Monochrome**    | `assets/android-icon-monochrome.png` | 512 × 512 px                     | Pure white silhouette on transparent background for Android 13+ themed icons.                                                            |
| **Adaptive Icon Background**    | `assets/android-icon-background.png` | 512 × 512 px                     | Flat solid background (`#F7F9FC` or `#1E4D8F`).                                                                                          |
| **Splash Screen Icon**          | `assets/splash-icon.png`             | 1024 × 1024 px                   | Transparent PNG centered symbol for the splash screen on `#F7F9FC` background.                                                           |
| **Google Play Feature Graphic** | For Play Console upload              | 1024 × 500 px                    | JPEG or 24-bit PNG (no alpha), max 15MB. Prominently displayed at the top of the Google Play store listing.                              |

---

## 2. Official Brand Palette (Design System Tokens)

All graphical artwork must adhere strictly to the Dastak design tokens:

### Primary Colors

- **Primary Blue**: `#1E4D8F` (Main brand color, trust, institutional authority)
- **Action Amber**: `#E8890C` (Primary call-to-action button, urgency)
- **Ink**: `#14233B` (High-contrast typography and iconography)

### Surface & Background

- **Light Background**: `#F7F9FC` (Default app canvas background)
- **Light Surface**: `#FFFFFF` (Card surfaces)
- **Muted Slate**: `#5B6B82` (Secondary captions, metadata)
- **Border**: `#E2E8F0` (Dividers, outlines)

### Dark Palette (For Reference)

- **Dark Background**: `#0B1320`
- **Dark Surface**: `#152238`
- **Dark Ink**: `#F1F5F9`
- **Dark Primary**: `#5D8DD1`

---

## 3. Brand Identity Guidelines

1. **Design Philosophy**: Simple, clean, authoritative, and accessible for first-time smartphone users across India.
2. **Icon Concept**: A recognizable door knocker or protective shield motif representing "Dastak" (the knock on the door for justice, rights, and recovery).
3. **Typography**: Clear, legible, sentence-case. No complex script flourishes.
4. **No Emojis**: Do not use cartoon emojis in store graphics or icon designs.
