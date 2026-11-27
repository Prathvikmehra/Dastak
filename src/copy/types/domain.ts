export interface LadderCopy {
  title: string;
  evidence: Record<string, string>;
  steps: Record<string, { who: string; how: string; request: string }>;
}

export interface PlaceCopy {
  name: string;
  title?: string;
  subtitle?: string;
  covers: string;
  keepReady: string[];
  howToSearch: string[];
  howToClaim: string[];
}

export interface CallScriptCopy {
  openers: {
    fraud: string;
    refund: string;
    bank: string;
    insurance: string;
  };
  amount: (amt: string) => string;
  companies: {
    fraud: (company: string) => string;
    refund: (company: string) => string;
    bank: (company: string) => string;
    insurance: (company: string) => string;
  };
  reference: (ref: string) => string;
  incidentDate: (date: string) => string;
  generalFallback1: string;
  generalFallback2: string;
  closers: {
    fraud: string;
    nch: string;
    general: string;
  };
  nchLanguagePreference: string;
  rbi: {
    complaintAgainst: (company: string) => string;
    complaintDetails: (date?: string, reference?: string) => string;
    guideOmbudsman: string;
  };
}

export interface DraftsCopy {
  to: (who: string) => string;
  subjectRefund: (company?: string) => string;
  subjectFraud: (company?: string) => string;
  subjectBank: (company?: string) => string;
  subjectInsurance: (company?: string) => string;
  salutation: string;
  introRefund: (company?: string, amount?: string) => string;
  introFraud: (company?: string, amount?: string) => string;
  introBank: (company?: string, amount?: string) => string;
  introInsurance: (company?: string, amount?: string) => string;
  incidentDate: (date: string) => string;
  counterparty: (company: string) => string;
  referencePolicy: (ref: string) => string;
  referenceAccount: (ref: string) => string;
  referenceOrder: (ref: string) => string;
  referenceTransaction: (ref: string) => string;
  detailsHeading: string;
  requestedActionHeading: string;
  thankYou: string;
  sincerely: string;
}
