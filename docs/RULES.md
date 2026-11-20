# Dastak Engineering and Design Rules

These rules are mandatory for all contributors, human and AI agents working on Dastak. Every future task must begin by reviewing this document.

---

## 1. Product Mission & Context

Dastak is a React Native (Expo) app built for everyday Indian citizens. It helps ordinary people:

1. **Fix problems**: Get refunds, report UPI payment fraud, resolve bank account errors, and contest rejected insurance claims.
2. **Find money**: Recover forgotten bank deposits, unclaimed insurance, and pension/provident funds, and reduce monthly medicine bills with equivalent generic alternatives.

---

## 2. Core Technical Stack

- **Framework**: React Native with Expo SDK (latest stable).
- **Language**: TypeScript with `strict: true`.
- **Router**: Expo Router (file-based routing with typed routes).
- **Styling**: Native StyleSheet backed by central theme tokens.
- **Icons**: Single icon family only (`Ionicons` from `@expo/vector-icons`). No emoji as icons.

---

## 3. Strict Folder Structure

```
dastak/
├── app/                          # Expo Router routes & stack/tab layouts only
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Exactly two tabs: "Fix" and "Find"
│   │   ├── fix/                  # Fix flow stack (index, new-case, case-detail, my-cases)
│   │   └── find/                 # Find flow stack (index, money-radar, medicine-saver)
│   ├── _layout.tsx               # Root stack provider and modal routes
│   └── help.tsx                  # Settings, language, and help modal
├── src/
│   ├── components/               # Core design system components
│   │   ├── Screen.tsx            # Safe area container
│   │   ├── Text.tsx              # 4 sizes only (title, subtitle, body, caption)
│   │   ├── Button.tsx            # primary (action token) and quiet variants
│   │   ├── Card.tsx              # 12dp radius surface card
│   │   ├── Field.tsx             # 48dp min touch target text input
│   │   ├── EmptyState.tsx        # Standard empty state layout
│   │   └── HeaderActions.tsx     # Header icon buttons
│   ├── theme/                    # Tokens, colors, typography, spacing, radius
│   ├── features/                 # Domain logic and features
│   │   ├── cases/                # Problem resolution & complaint cases
│   │   ├── money/                # Unclaimed money radar
│   │   └── medicine/             # Jan Aushadhi & generic medicine saver
│   └── lib/                      # Pure utilities (formatters, date, rupee)
└── docs/                         # Architecture, rules, and specifications
    └── RULES.md
```

---

## 4. Navigation Rules

1. **Exactly Two Bottom Tabs**:
   - **Fix**: Stack with Home (`What happened?` box + 4 issue doors), `NewCase`, `CaseDetail`, `MyCases`.
   - **Find**: Stack with Home (`Money radar` + `Medicine saver` cards), `MoneyRadar`, `MedicineSaver`.
   - **Nothing else on the tab bar**.
2. **Header Utilities**:
   - Settings, language selection, and help live behind a single small icon (`help-circle-outline`) in the header.
3. **Back Traps are Forbidden**:
   - The user must never be trapped on any screen. Back buttons, back titles, hardware back buttons, and swipe-to-back must always work predictably.
4. **Form Presentation**:
   - Forms with more than three fields are full screens, never pop-ups. Modals are only for short confirmations.

---

## 5. Design System Tokens

- **Background**: `#F7F9FC`
- **Surface / Card**: `#FFFFFF`
- **Ink (Text)**: `#14233B`
- **Muted (Secondary text)**: `#5B6B82`
- **Primary**: `#1E4D8F`
- **Action**: `#E8890C` (Used **only** for the single main button per screen in both themes)
- **OnAction**: `#14233B` (Dark ink text and icon on action button, 6.01:1 contrast in both light and dark themes)
- **Success**: `#1C8255` (Adjusted minimally from `#1F8A5B` to achieve 4.80:1 contrast on surface `#FFFFFF`)
- **Danger**: `#C0392B`
- **DangerSurface**: `#FDF2F2` (Light), `#3A1A1A` (Dark) (>= 4.5:1 contrast for both ink and danger in both themes)
- **Dark Mode Adjusted Tokens** (for WCAG 2.1 AA 4.5:1 ratio):
  - Primary: `#5D8DD1` (4.70:1 on dark surface `#152238`)
  - Danger: `#EC5A4A` (4.65:1 on dark surface `#152238`)
  - Success: `#2ECC71` (7.58:1 on dark surface `#152238`)
- **Card radius**: `12dp`
- **Button radius**: `8dp`
- **Touch target**: Minimum `48dp` on all interactive elements (buttons, inputs, cards, pills).
- **Typography**: Exactly 4 sizes across the entire app:
  1. `title`: 24sp (bold)
  2. `subtitle`: 18sp (semibold)
  3. `body`: 16sp (regular) — Body text is **always 16sp or larger**.
  4. `caption`: 14sp (medium)
- **Primary Action Rule**: Exactly **one** primary action button per screen. Secondary or auxiliary actions must use the `quiet` variant.
- **Theme**: Light theme by default, with dark mode support.

---

## 6. Copy and Language Style

- **Audience**: Plain words a first-time smartphone user understands.
- **Sentence-case**: Use sentence-case for all titles, buttons, headings, and labels.
- **No All-Caps**: Never use all-caps text (`SUBMIT` -> `Submit case`).
- **No Jargon**: Avoid technical jargon (say "Money cut from bank" instead of "Debit transaction initiated").
- **No Emoji Icons**: Do not use emojis as user interface icons; use `Ionicons` consistently.

---

## 7. Privacy & Engineering Policies

- **Ask Before Adding Dependencies**: Do not install any library or package without explicit user permission.
- **Strict Privacy ("Local-First")**: No user data leaves the device unless the user explicitly taps to share or export it. Drafts, case IDs, and search terms remain on the user's phone.
- **Data Stays on the Device**: All cases are persisted locally as a single versioned JSON document (`dastak_cases_v1`) via `KeyValueStorage` (`@react-native-async-storage/async-storage`). If saved data is corrupt, the app never crashes or wipes silently; it archives the raw string to a backup key and calmly notifies the user.
- **Local Escalation Reminders**: Future ladder milestones are planned via pure function `planReminders` firing at 9:00 AM local time on that step's day. Local notifications are managed with `expo-notifications`. Permission is requested with a one-screen explanation only after the first case is saved, never nags if declined, and can be toggled in Settings.
- **Type Safety**: TypeScript strict mode must pass with zero errors (`npx tsc --noEmit`).
- **Health Checks**: `npx expo-doctor` must always pass with zero failures.

---

## 8. Case Engine

- **Pure Functions Only**: All escalation calculation, timeline progression, and draft generation logic in `src/features/cases/engine.ts` must be pure functions with zero side-effects.
- **Injected Clock**: Never call `Date.now()`, `new Date()`, or hidden system clocks inside engine functions. All time calculations accept an explicit `now: Date` parameter to guarantee deterministic testing across timezones and midnight boundaries.
- **No Network Dependency**: Escalation ladders and draft builders run completely offline on-device with zero network requests. Contacts are sourced strictly from vetted local data.
