export interface LadderCopy {
  title: string;
  evidence: Record<string, string>;
  steps: Record<string, { who: string; how: string; request: string }>;
}

export interface PlaceCopy {
  name: string;
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
}
