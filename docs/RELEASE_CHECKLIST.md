# Dastak Release Checklist & Google Play Readiness

This document outlines the end-to-end checklist for launching Dastak version 1.0.0 on the Google Play Store.

---

## 1. Package Identifier Confirmation

- **Android Package**: `com.prathvikmehra.dastak`
- **Application ID / Slug**: `dastak`
- **Version**: `1.0.0` (versionCode: `1`)
- **Notice**: **OWNER MUST CONFIRM: cannot change after the first Play release.** Once an application is published or uploaded to the Google Play Console under this package name, the package name is permanently locked for the lifetime of the application.

---

## 2. Personal Actions Required by Project Owner

The following administrative and infrastructure setup must be performed directly by the account owner:

1. **Expo Account & EAS Setup**:
   - Register an Expo account at [expo.dev](https://expo.dev).
   - Run `npx eas-cli login` to authenticate the local environment.
   - Link project via `npx eas-cli project:init`.
   - Credentials management: Let EAS manage Android Keystores automatically on first build.

2. **Google Play Developer Account**:
   - Register an individual or organization Google Play Developer account ($25 USD one-time registration fee).
   - Complete developer identity verification.

3. **Public Privacy Policy Hosting**:
   - Google Play requires a publicly accessible HTTPS URL for the Privacy Policy.
   - Publish [docs/PRIVACY.md](file:///c:/Users/PRATHVIK/OneDrive/Desktop/Dastak/docs/PRIVACY.md) to GitHub Pages (e.g. `https://prathvikmehra.github.io/Dastak/privacy`) or an equivalent web host.
   - Provide this public URL in Google Play Console under **Policy > App content > Privacy Policy**.

4. **Internal Testing**:
   - Run `npx eas build --profile preview --platform android` to generate a standalone APK.
   - Distribute APK directly to family members and colleagues to verify on diverse physical Android devices (3-button navigation, gesture navigation, small and large system font scaling).

5. **Closed Testing Requirements**:
   - Review and verify current Google Play Console requirements for closed testing prior to production release on the Play Console Dashboard. Google periodically updates the mandatory tester quotas, testing durations, and engagement guidelines for newly created personal developer accounts. Always confirm the exact current requirements directly in your Google Play Console dashboard before attempting a production rollout.

---

## 3. Google Play Data Safety Form Answers

Derived strictly from the Dastak codebase:

| Question                                        | Answer             | Code Rationale                                                                                                                                                 |
| :---------------------------------------------- | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Does the app collect data?**                  | **No**             | No backend API or remote server exists. User entries remain in local device storage.                                                                           |
| **Does the app share data with third parties?** | **No**             | Zero third-party trackers, zero analytics SDKs, zero advertising IDs. User-initiated sharing via native Android Share Sheet is completely user-directed.       |
| **Is data encrypted in transit?**               | **Not applicable** | No user personal data is ever transmitted over network connections.                                                                                            |
| **Can users request data deletion?**            | **Yes**            | Built-in complete wipe available under **Settings > Delete all my data** (`deleteAllUserData`), removing all AsyncStorage entries and scheduled notifications. |
| **Cloud Backup Policy**                         | **Disabled**       | `android.allowBackup: false` set in `app.json`. Data does not sync to Google Drive.                                                                            |

---

## 4. Google Play Content Rating Notes

- **App Category**: Tools / Productivity / Utilities (Consumer Rights & Personal Finance Organizer)
- **Violence, Blood, or Gore**: None
- **Sexuality or Nudity**: None
- **Offensive Language**: None
- **Controlled Substances / Pharmaceuticals**: Dastak contains a "Medicine saver" feature where users can track monthly spending on prescribed medications and log generic price differences. Dastak does **not** sell, dispense, or prescribe medicines, and displays mandatory warnings instructing users never to switch or alter medications without consulting a qualified medical doctor or pharmacist.
- **Expected Rating**: PEGI 3 / Everyone.

---

## 5. Draft Store Listing

> **Notice**: All translations below are marked: **needs native-speaker review**.

### English (en-IN / en-US)

- **App Title**: Dastak
- **Short Description** (max 80 chars):
  Your rights, savings, and claims in one place. Step-by-step citizen assistance.
- **Full Description**:
  Dastak helps everyday Indian citizens resolve consumer complaints, dispute unfair bank charges, report payment fraud, and recover unclaimed financial assets.

  WHAT DASTAK HELPS YOU DO:
  1. Fix consumer and financial issues:
     - Recover delayed e-commerce refunds.
     - Urgent reporting and action guidance for UPI or payment fraud (helpline 1930).
     - Contest wrongful bank deductions, ATM failed cash, and EMI errors.
     - Appeal rejected insurance and mediclaim claims with clear escalation ladders.
  2. Find money and reduce bills:
     - Search official portals for forgotten bank deposits, life insurance, and EPF.
     - Track monthly medicine expenses and note lower-price generic alternatives.
  3. Escalation letters & reminders:
     - Plain-language formal draft letters tailored to each complaint stage.
     - Calm reminders on the day your case escalates to ombudsman authorities.

  PRIVACY FIRST:
  - 100% on-device local storage.
  - Zero cloud servers, zero analytics, zero ads.
  - Your personal records stay exclusively on your phone.

### Hindi (hi-IN) - _needs native-speaker review_

- **App Title**: Dastak (दस्तक)
- **Short Description**:
  आपके अधिकार, बचत और क्लेम एक ही जगह पर। आसान नागरिक सहायता।
- **Full Description**:
  दस्तक भारतीय नागरिकों को उपभोक्ता शिकायतों, बैंक समस्याओं, ऑनलाइन धोखाधड़ी और अनक्लेम्ड पैसों को वापस पाने में मदद करता है।

  दस्तक आपकी कैसे मदद करता है:
  1. समस्याओं का समाधान:
     - रुके हुए ई-कॉमर्स रिफंड प्राप्त करें।
     - यूपीआई या भुगतान धोखाधड़ी की तुरंत रिपोर्टिंग (साइबर हेल्पलाइन 1930)।
     - बैंक के गलत चार्ज, एटीएम में पैसे फंसने और ईएमआई विवादों का निपटारा।
     - खारिज किए गए बीमा क्लेम के लिए सही शिकायत पत्र और चरण।
  2. बचत और अनक्लेम्ड पैसा:
     - पुराने बैंक खातों, बीमा पॉलिसियों और पीएफ के अनक्लेम्ड पैसों की खोज।
     - मासिक दवा खर्च को ट्रैक करें और जेनेरिक विकल्पों से बचत नोट करें।
  3. पूर्ण गोपनीयता:
     - सारा डेटा केवल आपके फोन पर रहता है। कोई बैकएंड सर्वर नहीं, कोई विज्ञापन नहीं।

### Gujarati (gu-IN) - _needs native-speaker review_

- **App Title**: Dastak (દસ્તક)
- **Short Description**:
  તમારા અધિકારો, બચત અને ક્લેમ એક જ જગ્યાએ. સરળ નાગરિક સહાય.
- **Full Description**:
  દસ્તક સામાન્ય નાગરિકોને ઉપભોક્તા ફરિયાદો, બેંક વિવાદો, ઓનલાઈન છેતરપિંડી અને વણવપરાયેલી રકમ પુનઃપ્રાપ્ત કરવામાં મદદ કરે છે.

  દસ્તક તમને કેવી રીતે મદદ કરે છે:
  1. સમસ્યાઓનું નિરાકરણ:
     - અટકેલા રિફંડ પાછા મેળવો.
     - યુપીઆઈ કે પેમેન્ટ ફ્રોડની તાત્કાલિક જાણ (સાયબર હેલ્પલાઇન 1930).
     - બેંકના ખોટા ચાર્જ અને એટીએમ વિવાદોનું નિરાકરણ.
     - નામંજૂર વીમા દાવાઓ સામે પગલાં લેવા માટેની માર્ગદર્શિકા.
  2. બચત અને શોધ:
     - જૂના બેંક ખાતાઓ અને પીએફમાં પડેલા વણદાવા થયેલા નાણાંની શોધ.
     - માસિક દવાઓના ખર્ચની નોંધ રાખો અને જેનરિક વિકલ્પોથી બચત તપાસો.
  3. સંપૂર્ણ ગોપનીયતા:
     - તમારો બધો ડેટા ફક્ત તમારા ફોન પર જ રહે છે.

---

## 6. Known Limits of Version 1

Before releasing version 1.0.0, the team and testers must acknowledge the current functional boundaries:

1. **Device-Only Architecture**: All data resides strictly on the user's phone (`AsyncStorage`). No cross-device synchronization, family cloud sharing, or web dashboard exists. If a user changes phones, data does not transfer automatically.
2. **No Voice Input or Audio Playback**: Interface requires touch interactions and reading; voice dictation and speech synthesis are not implemented.
3. **No Automatic Document or Screenshot OCR**: The app does not inspect transaction screenshots or parse bank statements via computer vision. Users input transaction details manually.
4. **Drafts in English**: Escalation grievance letters are generated in English to align with official banking ombudsman and company nodal officer requirements.
5. **Translations Pending Final Native Sign-Off**: Hindi and Gujarati UI copy has undergone automated copy audit and initial translation review, but requires final verification by native legal/linguistic reviewers before general distribution (see [docs/TRANSLATION_REVIEW.md](file:///c:/Users/PRATHVIK/OneDrive/Desktop/Dastak/docs/TRANSLATION_REVIEW.md)).
6. **Helpline & Portal Directory Status**: Escalation contacts and portals were verified against secondary resources and finance explainers, not live government APIs (see [docs/CONTACTS.md](file:///c:/Users/PRATHVIK/OneDrive/Desktop/Dastak/docs/CONTACTS.md)).
