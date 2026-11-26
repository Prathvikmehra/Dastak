# Building and Testing Your First Android Preview APK

This guide is written for Windows PowerShell users who want to build and install Dastak on a physical Android phone without needing Android Studio or complex local toolchains.

---

## Prerequisites: Zero Local SDK Required

EAS (Expo Application Services) builds the standalone APK in the cloud. You only need:

- A Windows computer with Node.js installed.
- PowerShell.
- An Android smartphone (Android 8.0 or newer).
- A free Expo account.

---

## Step 1: Create an Expo Account

1. Go to [https://expo.dev/signup](https://expo.dev/signup).
2. Create a free account (choose a username and password).

---

## Step 2: Log In via PowerShell

Open PowerShell, navigate to the Dastak project folder, and run:

```powershell
cd C:\Users\PRATHVIK\OneDrive\Desktop\Dastak
npx eas-cli login
```

Enter your Expo account username/email and password when prompted.

---

## Step 3: Trigger the Preview Build

Run the following command in PowerShell:

```powershell
npx eas-cli build --platform android --profile preview
```

### Important: First-Time Keystore Prompt

On your first Android build, EAS CLI will ask:

> _"Would you like to generate a new Android keystore?"_ or _"Generate a new Android Keystore?"_

**Action: Choose YES / Let EAS manage your credentials.**

- EAS will securely generate and store your Android signing credentials in your Expo vault.
- You do not need to generate local `.jks` or `.keystore` files manually.

---

## Step 4: Where to Find Your Built APK

1. As the build starts, EAS CLI will output a web URL in PowerShell:
   ```text
   https://expo.dev/accounts/<your-username>/projects/dastak/builds/<build-id>
   ```
2. The build runs in Expo's cloud runners (typically takes 5–10 minutes).
3. Once finished, PowerShell will print:
   - A direct link to download the `.apk` file.
   - A terminal QR code that you can scan directly with your phone's camera.
4. You can also view and download the APK at any time from your browser at [https://expo.dev](https://expo.dev) under **Builds**.

---

## Step 5: How to Install the APK on Your Android Phone

1. **Download the APK**:
   - Open the APK download link in Chrome on your phone, or scan the QR code.
   - Tap **Download anyway** if Android warns _"File might be harmful"_.
2. **Enable Unknown Apps**:
   - When tapping the downloaded `.apk`, Android may prompt: _"For your security, your phone is not allowed to install unknown apps from this source."_
   - Tap **Settings** on the prompt.
   - Switch on **Allow from this source** (for Chrome or your browser).
3. **Complete Installation**:
   - Tap **Install**.
   - Tap **Open** once installation completes.

---

## Step 6: What to Check on the First Real Install

Perform this quick 5-point sanity checklist on physical hardware:

1. **Tab Labels & Safe Area**:
   - Verify both bottom tabs (**Fix** and **Find**) are fully visible.
   - Test on both **3-button navigation** (Back, Home, Overview buttons at the bottom) and **Gesture navigation**. Confirm labels are never cut off.
2. **Dark Mode Follows Phone**:
   - Open Dastak Settings (gear icon in header) and ensure **Display mode** is set to **System**.
   - Pull down your phone's Android quick settings shade and toggle **Dark theme** on and off.
   - Confirm Dastak switches dynamically between light and dark palettes.
3. **Notification Permission**:
   - Under Settings, turn on **Escalation reminders** (or schedule a reminder on a case).
   - On Android 13+, confirm the native permission dialog (_"Allow Dastak to send you notifications?"_) appears.
4. **Delete All My Data**:
   - Create a test case and a medicine entry.
   - Go to Settings > **Delete all my data** > tap **Delete everything**.
   - Confirm the success dialog appears.
5. **Kill and Reopen**:
   - Swipe Dastak away from your Android Recent Apps list to kill the process.
   - Tap the Dastak icon on your home screen to relaunch.
   - Verify the app launches cleanly with empty states on both Fix and Find.
