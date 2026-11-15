# Agent Instructions for Dastak

Welcome to the Dastak codebase. Before writing or modifying any code, you must read and adhere to our engineering rules.

## Primary Rulebook

Read [docs/RULES.md](file:///c:/Users/PRATHVIK/OneDrive/Desktop/Dastak/docs/RULES.md) before starting any task.

### Core Tenets:

1. **Never add dependencies without asking**: Check with the lead / user before adding any npm package.
2. **Local-first privacy**: No data leaves the device unless the user explicitly shares it.
3. **Strict design system**:
   - Background `#F7F9FC`, Surface `#FFFFFF`, Ink `#14233B`, Muted `#5B6B82`, Primary `#1E4D8F`, Action `#E8890C` (one main button per screen only).
   - 12dp card radius, 8dp button radius, minimum 48dp touch targets.
   - Text has 4 sizes only; body text is 16sp or larger.
   - Single icon set: `Ionicons`. No emoji icons.
   - Plain sentence-case copy without jargon or all-caps.
4. **Navigation**: Exactly two bottom tabs: "Fix" and "Find". Header contains settings/help icon. Back always works.
5. **Quality Gates**:
   - `npx tsc --noEmit` must pass with 0 errors.
   - `npx expo-doctor` must pass with 0 failures.
