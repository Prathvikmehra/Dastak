# Dastak Branding & Visual Asset Status

> **Asset Status**: The 7 core app PNG assets have been supplied into `assets/` (`icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`, `splash-icon.png`, `splash-icon-dark.png`, `favicon.png`).
>
> **Notice**: These supplied assets are **placeholders** ("simple door-and-knocker design, replace with professional artwork before wide release"). They establish proper dimensions (1024x1024 for icons/splash, 48x48 for favicon) and verify clean builds, but final polished graphic assets from a professional designer should replace them before general public distribution.
>
> **Physical Device Verification**: Splash screen appearance (light background `#F7F9FC` with blue door logo; dark background `#0B1320` with white door logo) must be confirmed on a real physical phone in both light and dark mode.

---

## 1. Supplied In-App Assets (Placeholders Verified)

| Asset                          | File Destination                     | Dimensions     | Status                                  |
| :----------------------------- | :----------------------------------- | :------------- | :-------------------------------------- |
| **Main App Icon**              | `assets/icon.png`                    | 1024 × 1024 px | Supplied (Placeholder door-and-knocker) |
| **Adaptive Foreground**        | `assets/android-icon-foreground.png` | 1024 × 1024 px | Supplied (Placeholder door-and-knocker) |
| **Adaptive Background**        | `assets/android-icon-background.png` | 1024 × 1024 px | Supplied (Solid `#F7F9FC`)              |
| **Adaptive Monochrome**        | `assets/android-icon-monochrome.png` | 1024 × 1024 px | Supplied (Themed icon layer)            |
| **Splash Screen Icon (Light)** | `assets/splash-icon.png`             | 1024 × 1024 px | Supplied (Blue door on transparent)     |
| **Splash Screen Icon (Dark)**  | `assets/splash-icon-dark.png`        | 1024 × 1024 px | Supplied (White door on transparent)    |
| **Web Favicon**                | `assets/favicon.png`                 | 48 × 48 px     | Supplied (48px door icon)               |

---

## 2. Still Missing for Google Play Store Listing

The owner must still produce the following marketing assets before submitting to Google Play Console:

1. **Google Play Store Icon**:
   - **Dimensions**: Exactly 512 × 512 px.
   - **Format**: 32-bit PNG, max 1024 KB.
   - **Specifications**: Square (Google Play automatically applies squircle mask and drop shadow).

2. **Google Play Feature Graphic**:
   - **Dimensions**: Exactly 1024 × 500 px.
   - **Format**: JPEG or 24-bit PNG (no transparency), max 15 MB.
   - **Content**: Clean visual banner displaying the Dastak name, tagline (_"Your rights, savings, and claims in one place"_), and primary blue (`#1E4D8F`) / safety amber (`#E8890C`) brand accents.

3. **Phone Screenshots**:
   - **Requirements**: Minimum 2 portrait screenshots (maximum 8), 16:9 or 9:16 aspect ratio, each side between 320 px and 3,840 px.
   - **Recommended Screens to Capture**:
     1. Fix tab home with 4 category cards (Refund, Fraud, Bank dispute, Insurance claim).
     2. Case detail screen with escalation ladder and draft grievance letter.
     3. Find tab home showing Money radar and Medicine saver cards.
     4. Medicine saver screen showing generic alternatives and monthly savings.
     5. Settings modal showing privacy notice and language picker (English, Hindi, Gujarati).

---

## 3. Official Brand Palette (Design System Tokens)

Any new artwork must strictly use these token hex colors:

- **Primary Blue**: `#1E4D8F` (Institutional authority, primary headers, door motif)
- **Action Amber**: `#E8890C` (Main action button, knocker accent)
- **Ink**: `#14233B` (Typography and dark elements)
- **Light Background**: `#F7F9FC` (Default canvas and splash light background)
- **Dark Background**: `#0B1320` (Dark theme and splash dark background)
- **Surface**: `#FFFFFF` (Card background)
- **Muted Slate**: `#5B6B82` (Secondary captions)
- **Border**: `#E2E8F0` (Dividers, outlines)
