import { MoneyPlace } from './types';

export const PLACES: MoneyPlace[] = [
  {
    id: 'udgam',
    title: 'Old bank deposits',
    subtitle: 'Savings, current, and fixed deposits not used for 10 or more years',
    portalName: 'RBI UDGAM',
    source: 'https://udgam.rbi.org.in',
    verifiedOn: null,
    covers:
      'Unclaimed savings accounts, fixed deposits, and recurring deposits across participating banks in India. UDGAM does not cover post office savings, provident fund, or insurance.',
    keepReady: [
      'Name as written in the old bank passbook or deposit receipt',
      'PAN card',
      'Aadhaar card',
      'Mobile number linked to your active bank account',
      'Old account number or deposit certificate if available',
    ],
    howToSearch: [
      'Register with your mobile number on the official RBI UDGAM portal.',
      'Enter the account holder name and at least one official document number (such as PAN).',
      'Check the search results for any matching unclaimed accounts held by participating banks.',
    ],
    howToClaim: [
      'Note the bank name and account reference shown in your search result.',
      'Visit that specific bank branch in person with your identity and address documents.',
      'Submit the bank’s claim form with your old passbook or deposit certificate to receive the balance in your active bank account.',
    ],
  },
  {
    id: 'bimabharosa',
    title: 'Insurance proceeds',
    subtitle: 'Matured life or general insurance policies and unpaid claim amounts',
    portalName: 'IRDAI Bima Bharosa',
    source: 'https://bimabharosa.irdai.gov.in',
    verifiedOn: null,
    covers:
      'Unclaimed policy dues, death claims, maturity payouts, and premium refunds held by insurance companies in India.',
    keepReady: [
      'Policyholder name as shown on the insurance policy document',
      'Date of birth of the policyholder',
      'PAN card',
      'Policy number if known',
      'Bank account details and cancelled cheque for payout',
    ],
    howToSearch: [
      'Open the official Bima Bharosa portal created by IRDAI.',
      'Search using the policyholder name, date of birth, and PAN or policy number.',
      'Review any unpaid policy balances reported by insurers.',
    ],
    howToClaim: [
      'Contact the grievance or claims team of the insurer listed in your search result.',
      'Provide your original policy document or indemnity bond along with KYC documents.',
      'The insurance company verifies your claim and transfers the payment directly into your bank account.',
    ],
  },
  {
    id: 'mfcentral',
    title: 'Mutual funds',
    subtitle: 'Unclaimed dividends and redemption payouts from mutual fund investments',
    portalName: 'MITRA on MF Central',
    source: 'https://www.mfcentral.com',
    verifiedOn: null,
    covers:
      'Unclaimed mutual fund redemption proceeds and dividend warrants across Indian fund houses.',
    keepReady: [
      'PAN card of the investor',
      'Mobile number or email registered with mutual fund folios',
      'Old folio number or account statement if available',
      'Active bank account details for verification',
    ],
    howToSearch: [
      'Log in to the official MF Central portal (managed by CAMS and KFintech).',
      'Navigate to the unclaimed dividends and redemptions section (MITRA).',
      'Search using your PAN to see if any fund house holds unpaid redemption or dividend money.',
    ],
    howToClaim: [
      'Follow the claim instructions on MF Central or the mutual fund’s official website.',
      'Verify your current bank account and complete KYC revalidation if requested.',
      'The fund house transfers the unclaimed amount directly to your verified bank account.',
    ],
  },
  {
    id: 'iepf',
    title: 'Shares and unpaid dividends',
    subtitle: 'Dividends and shares transferred after 7 years of remaining unclaimed',
    portalName: 'IEPF Portal',
    source: 'https://www.iepf.gov.in',
    verifiedOn: null,
    covers:
      'Unpaid corporate dividends, matured company deposits, and company shares transferred to the Investor Education and Protection Fund Authority.',
    keepReady: [
      'Shareholder name as recorded with the company',
      'PAN card and Aadhaar card',
      'Client Master List (CML) of your active demat account',
      'Original physical share certificates or old dividend counterfoils if available',
    ],
    howToSearch: [
      'Go to the official IEPF portal run by the Ministry of Corporate Affairs.',
      'Use the "Search Unclaimed / Unpaid Amounts" service with your name or Folio/DP ID.',
      'Check the search result for the company name, folio number, and amount of dividend or shares.',
    ],
    howToClaim: [
      'Submit Form IEPF-5 on the official MCA website as per the official site instructions.',
      'Send a signed copy of the filed form and supporting documents to the company’s Nodal Officer.',
      'After the company verifies your documents, the IEPF Authority refunds the money to your bank account and shares to your demat account.',
    ],
  },
  {
    id: 'epfo',
    title: 'Old EPF accounts',
    subtitle: 'Provident fund balances from past jobs not merged into your current UAN',
    portalName: 'EPFO Unified Portal',
    source: 'https://unifiedportal-mem.epfindia.gov.in',
    verifiedOn: null,
    covers:
      'Old Employees’ Provident Fund (EPF) accounts from previous jobs that became inoperative or were left un-transferred.',
    keepReady: [
      'Active Universal Account Number (UAN)',
      'Aadhaar card linked with mobile for OTP',
      'PAN card',
      'Old Member ID or establishment/company name from past employment',
    ],
    howToSearch: [
      'Sign in to the EPFO Member Unified Portal with your UAN and password.',
      'Open "View" and select "Service History" to view all member IDs linked to past employers.',
      'Check passbooks for past accounts to identify any un-transferred balances.',
    ],
    howToClaim: [
      'Submit an online transfer claim through "One Member – One EPF Account" to merge old balances into your current active account.',
      'If you have retired or are no longer in EPF-covered service, file an online withdrawal claim on the portal.',
      'EPFO processes the request and deposits the settlement into your linked bank account.',
    ],
  },
  {
    id: 'postoffice',
    title: 'Post office savings',
    subtitle: 'Matured NSC, KVP certificates, time deposits, and old savings accounts',
    portalName: 'Nearest Post Office',
    source: null,
    verifiedOn: null,
    covers:
      'Matured National Savings Certificates (NSC), Kisan Vikas Patra (KVP), monthly income schemes, and post office savings passbooks.',
    keepReady: [
      'Name as written on the original certificate or passbook',
      'Aadhaar card and PAN card',
      'Original paper certificates (NSC/KVP) or post office passbook',
      'Passport size photograph and bank account passbook or cancelled cheque',
    ],
    howToSearch: [
      'There is no online search portal for older paper post office certificates.',
      'Visit the post office branch where the account or certificate was issued, or your nearest Head Post Office.',
      'Ask the postal counter clerk to look up the certificate number in the postal register.',
    ],
    howToClaim: [
      'Fill out the post office redemption voucher (Form SB-7 or certificate discharge form).',
      'Hand over the original physical certificate or passbook with your identity and bank documents.',
      'The post office verifies the records and issues payment via cheque or direct transfer to your bank account.',
    ],
  },
];
