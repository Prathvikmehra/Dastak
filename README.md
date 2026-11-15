# Dastak (दस्तक)

Dastak is a React Native (Expo) app built for India. It helps ordinary citizens:

- **Fix problems**: Handle UPI fraud, failed e-commerce refunds, bank account disputes, and contested insurance claims.
- **Find money**: Uncover forgotten bank deposits, unclaimed insurance, provident funds, and reduce medicine expenses with generic Jan Aushadhi alternatives.

---

## Technical Stack

- **Framework**: React Native 0.88 with Expo SDK 58
- **Language**: TypeScript (strict mode)
- **Routing**: Expo Router (file-based navigation)
- **Design System**: Accessible tokens with 48dp minimum touch targets, 4 type sizes, and light/dark mode support
- **Icons**: Ionicons (`@expo/vector-icons`)

---

## Getting Started

### Prerequisites

- Node.js (v20 or newer recommended)
- npm or yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Prathvikmehra/Dastak.git
cd Dastak
npm install
```

### Running the App

Start the Expo development server:

```bash
npm start
```

From the terminal:

- Press `a` to run on an Android emulator or connected device.
- Press `i` to run on an iOS simulator (macOS only).
- Press `w` to run in the web browser.
- Scan the QR code using Expo Go on your physical Android/iOS device.

### Running Quality Checks

Check TypeScript types:

```bash
npx tsc --noEmit
```

Check project health and dependencies:

```bash
npx expo-doctor
```

Run linter:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

---

## Architecture & Contribution Rules

Before writing code or proposing changes, read [docs/RULES.md](docs/RULES.md).

- Do not add new third-party dependencies without explicit approval.
- All user drafts and search queries stay local on the device.
- Follow the two-tab router structure: **Fix** and **Find**.
