import { MoneyPlace } from './types';

export const FOLLOW_OFFICIAL_SITE_NOTICE =
  'If the official site says something different, follow the official site.';

export const OTP_SAFETY_TIP =
  'Never share an OTP with anyone who offers to find your money. Official searches are free.';

export const PLACES: MoneyPlace[] = [
  {
    id: 'udgam',
    title: 'Old bank deposits',
    subtitle: 'Unclaimed bank deposits',
    portalName: 'RBI UDGAM',
    source: 'https://udgam.rbi.org.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
    covers:
      'Covers deposits across many major banks, not every bank; does not cover post office, PF or insurance.',
    keepReady: [
      'ID and address proof',
      'Old passbook or deposit proof if you have it',
      'Nominee claims usually need a death certificate; legal heirs may need a legal heir or succession certificate',
    ],
    howToSearch: [
      'Register with your name, mobile number and a password, confirm with the OTP, and log in.',
      'Enter the account holder’s name, select the bank or banks, and give one ID detail (PAN, voter ID, driving licence, passport number or date of birth).',
    ],
    howToClaim: [
      'UDGAM only shows where the money is. The claim itself is made at the bank, with a claim form and KYC.',
      FOLLOW_OFFICIAL_SITE_NOTICE,
    ],
  },
  {
    id: 'bimabharosa',
    title: 'Insurance proceeds',
    subtitle: 'Unclaimed insurance amounts',
    portalName: 'IRDAI Bima Bharosa',
    source: 'https://bimabharosa.irdai.gov.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
    covers:
      'Insurers must make unclaimed amounts of ₹1,000 and above searchable on their own websites; Bima Bharosa’s Unclaimed Amount page links to each insurer’s search page and has an IRDAI query form (it asks name, mobile number, date of birth, insurer, policy number) for maturity, death claim or other amounts that were due.',
    keepReady: [
      'Name, mobile number, date of birth, insurer name, and policy number if known',
      'KYC documents and bank account details for payout',
      'For nominee claims: death certificate, claim form, and proof of nomination',
      'If no nominee: the insurer may ask for legal heir or succession papers',
      'If the original policy is lost, the insurer may ask for an indemnity bond',
    ],
    howToSearch: [
      'Open Bima Bharosa’s Unclaimed Amount page to find links to each insurer’s search page.',
      'You can also use the IRDAI query form on the site, which asks for name, mobile number, date of birth, insurer, and policy number.',
    ],
    howToClaim: ['Contact the insurer with KYC and bank details.', FOLLOW_OFFICIAL_SITE_NOTICE],
  },
  {
    id: 'mfcentral',
    title: 'Mutual funds',
    subtitle: 'Inactive folios and unclaimed amounts',
    portalName: 'MITRA on MF Central',
    source: 'https://www.mfcentral.com',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
    covers:
      'MITRA on MF Central traces inactive folios (no transaction in ten years) and unclaimed amounts. AMC and AMFI websites also have an Unclaimed Amounts section.',
    keepReady: [
      'PAN, date of birth, mobile number, name, or address',
      'Folio number if available',
      'KYC details and active bank account proof',
    ],
    howToSearch: [
      'Open MF Central, choose MITRA, and search with PAN, date of birth, mobile number, name or address.',
      'AMC and AMFI websites also have an "Unclaimed Amounts" section where you can search by PAN or folio number.',
    ],
    howToClaim: [
      'Follow the guidance MITRA or the fund house gives, which may include a KYC update.',
      FOLLOW_OFFICIAL_SITE_NOTICE,
    ],
  },
  {
    id: 'iepf',
    title: 'Shares and unpaid dividends',
    subtitle: 'Unclaimed dividends and shares',
    portalName: 'IEPF Authority',
    source: 'https://www.iepf.gov.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
    covers: 'Money and shares go to the IEPF Authority after 7 years unclaimed.',
    keepReady: [
      'Shareholder details and active demat account details',
      'Identity and address proof',
      'Verification documents required by the company and the MCA',
    ],
    howToSearch: [
      'Use the IEPF website’s tools for finding unclaimed amounts, and check the company’s own website.',
    ],
    howToClaim: [
      'Claim by filing Form IEPF-5 on the MCA website and sending the required documents to the company, as the official site instructs.',
      FOLLOW_OFFICIAL_SITE_NOTICE,
    ],
  },
  {
    id: 'epfo',
    title: 'Old EPF accounts',
    subtitle: 'Provident fund balances',
    portalName: 'EPFO Member Portal',
    source: 'https://unifiedportal-mem.epfindia.gov.in',
    verifiedOn: null,
    contentStatus: 'checked-against-secondary-sources',
    covers: 'Old provident fund accounts from previous employers linked to your records.',
    keepReady: [
      'Universal Account Number (UAN) and login password',
      'Aadhaar linked with mobile number for verification',
      'Bank details linked to your EPF account',
    ],
    howToSearch: [
      'Log in to the EPFO member portal with your UAN.',
      'Look at your passbook and the employers linked to your UAN.',
    ],
    howToClaim: [
      'To combine old accounts use the transfer service the portal offers ("One Member One EPF Account"). Withdrawal is also a claim on the portal.',
      FOLLOW_OFFICIAL_SITE_NOTICE,
    ],
  },
  {
    id: 'postoffice',
    title: 'Post office savings',
    subtitle: 'Older certificates and passbooks',
    portalName: 'Nearest Post Office',
    source: null,
    verifiedOn: null,
    contentStatus: 'general-guidance',
    covers: 'Older post office certificates or savings passbooks.',
    keepReady: ['Original certificate or passbook', 'Identity proof and address proof'],
    howToSearch: ['There is no central online search for older certificates or passbooks.'],
    howToClaim: [
      'Visit the issuing post office or your nearest Head Post Office with the original certificate or passbook and ID, and ask what form and documents they need.',
      FOLLOW_OFFICIAL_SITE_NOTICE,
    ],
  },
];
