import { PlaceCopy } from '../types';

export const enPlaces: Record<string, PlaceCopy> = {
  udgam: {
    name: 'UDGAM Portal',
    covers:
      'Covers deposits across many major banks, not every bank; does not cover post office, PF or insurance.',
    keepReady: [
      'Identity proof (PAN, voter ID, driving licence, passport or date of birth)',
      'Address proof',
      'Old passbook or deposit proof if you have it',
      'For nominee claims: death certificate of the account holder',
      'For legal heir claims: succession certificate or legal heir proof',
    ],
    howToSearch: [
      'Register with your name, mobile number and a password.',
      'Confirm with the OTP and log in.',
      'Enter the account holder’s name, select the bank or banks, and provide one ID detail.',
    ],
    howToClaim: [
      'UDGAM only shows where the money is. The claim itself is made directly at the bank.',
      'Visit the bank branch with a claim form and KYC documents.',
    ],
  },
  bimabharosa: {
    name: 'Bima Bharosa',
    covers: 'Unclaimed policy amounts across life and general insurance companies in India.',
    keepReady: [
      'Policy number if available',
      'Date of birth of the policyholder',
      'Identity proof and bank details for claim payout',
    ],
    howToSearch: [
      'Open Bima Bharosa’s Unclaimed Amount page to find links to each insurer’s search page.',
      'You can also use the IRDAI query form on the site, which asks for name, mobile number, date of birth, insurer, and policy number.',
    ],
    howToClaim: ['Contact the insurer with KYC and bank details.'],
  },
  mfcentral: {
    name: 'MF Central / AMFI',
    covers: 'Unclaimed dividends and redemption payouts from Indian mutual funds.',
    keepReady: [
      'PAN of the investor',
      'Mobile number registered with your mutual fund folio',
      'Bank account details and cancelled cheque for bank mandate update',
    ],
    howToSearch: [
      'Log in to MF Central using your PAN and registered mobile number.',
      'Check the unclaimed dividend and redemption section across mutual funds.',
    ],
    howToClaim: [
      'Submit a request on MF Central or contact the fund house (AMC) with updated bank details.',
    ],
  },
  iepf: {
    name: 'IEPF Authority',
    covers:
      'Unclaimed dividends, matured deposits, debentures, and shares transferred to the Investor Education and Protection Fund after 7 years of non-claim.',
    keepReady: [
      'PAN and Aadhaar of the claimant',
      'Client Master List (CML) for shares or original share certificates',
      'Bank details, cancelled cheque, and indemnity bond',
    ],
    howToSearch: [
      'Visit the IEPF search page at iepf.gov.in.',
      'Search by investor name, folio number, or company name.',
    ],
    howToClaim: [
      'Register on MCA21 and file Form IEPF-5 online.',
      'Send the printed form along with original documents to the company nodal officer.',
    ],
  },
  epfo: {
    name: 'EPFO Member Portal',
    covers: 'Provident fund balances in inoperative or un-transferred EPF accounts.',
    keepReady: [
      'Universal Account Number (UAN) or previous PF member ID',
      'Aadhaar linked with mobile for OTP',
      'Bank account details seeded with EPFO',
    ],
    howToSearch: [
      'Log in to the EPFO Unified Member Portal using your UAN and password.',
      'Check your passbook balance and verify your service history.',
    ],
    howToClaim: ['Submit an online transfer or claim form (Form 19/10C/31) through the portal.'],
  },
  postoffice: {
    name: 'Department of Posts',
    covers: 'Older post office certificates or savings passbooks.',
    keepReady: ['Original certificate or passbook', 'Identity proof and address proof'],
    howToSearch: ['There is no central online search for older certificates or passbooks.'],
    howToClaim: [
      'Visit the issuing post office or your nearest Head Post Office with the original certificate or passbook and ID, and ask what form and documents they need.',
    ],
  },
};

export const enFollowOfficialSite =
  'If the official site says something different, follow the official site.';
export const enOtpSafetyTip =
  'Never share an OTP with anyone who offers to find your money. Official searches are free.';
