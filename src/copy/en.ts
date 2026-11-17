/**
 * Central English copy dictionary for Dastak.
 * Plain, sentence-case words accessible to first-time smartphone users.
 * All user-facing strings are defined here for upcoming Hindi & Gujarati localization.
 */

export const copy = {
  common: {
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    done: 'Done',
    today: 'Today',
    call: 'Call',
    website: 'Website',
    share: 'Share',
  },
  fixHome: {
    title: 'What happened?',
    subtitle:
      'Choose what went wrong. We will guide you step by step to get your money or resolution.',
    summaryTitle: (count: number) => `You have ${count} open case${count === 1 ? '' : 's'}`,
    viewMyCases: 'View my cases',
    recoveredBanner: (amount: string) => `Recovered so far: ${amount}`,
    doors: {
      refund: {
        title: 'Failed refund',
        subtitle: 'Order cancelled or returned but money not received',
      },
      fraud: {
        title: 'Payment fraud',
        subtitle: 'UPI scam, fake link, or unauthorized debit from account',
      },
      bank: {
        title: 'Bank dispute',
        subtitle: 'ATM cash failed, wrong charges, or account issue',
      },
      insurance: {
        title: 'Rejected insurance',
        subtitle: 'Claim denied or delayed without a clear reason',
      },
    },
  },
  newCase: {
    title: 'Start a case',
    subtitle: 'Tell us a few details so we can give you the right complaint steps and letter.',
    issueTypeLabel: 'Select what happened',
    companyLabel: 'Company or bank name',
    companyPlaceholder: 'e.g. Flipkart, Amazon, SBI, HDFC',
    amountLabel: 'Amount in dispute',
    amountPlaceholder: 'e.g. 1999',
    referenceLabel: 'Order ID or reference number',
    referencePlaceholder: 'e.g. OD123456789 or UTR number',
    incidentDateLabel: 'When did this happen?',
    incidentDatePlaceholder: 'e.g. Yesterday, or 10 Nov 2026',
    noteLabel: 'What happened? (optional)',
    notePlaceholder: 'Tell us what happened in your own words',
    saveButton: 'Save case',
    issueRequired: 'Please select an issue type to continue.',
    fieldLabels: {
      refund: {
        company: 'Seller or app',
        companyPlaceholder: 'e.g. Flipkart, Amazon, Swiggy',
        reference: 'Order ID',
        referencePlaceholder: 'e.g. OD123456789',
      },
      fraud: {
        company: 'Who took the money? Name, number or UPI ID, if you know',
        companyPlaceholder: 'e.g. 9876543210 or user@upi',
        reference: 'Transaction ID',
        referencePlaceholder: 'e.g. 12-digit UTR number',
      },
      bank: {
        company: 'Bank name',
        companyPlaceholder: 'e.g. State Bank of India, HDFC Bank',
        reference: 'Account or card, last 4 digits, or complaint number',
        referencePlaceholder: 'e.g. Card ending 1234, or Ref No.',
      },
      insurance: {
        company: 'Insurance company',
        companyPlaceholder: 'e.g. Star Health, LIC, ICICI Lombard',
        reference: 'Policy or claim number',
        referencePlaceholder: 'e.g. POL-98765432 or Claim ID',
      },
    },
    fraudTiming: {
      label: 'When did it happen?',
      hour: 'In the last hour',
      today: 'Earlier today',
      yesterday: 'Yesterday',
      earlier: 'More than 2 days ago',
    },
  },
  caseDetail: {
    dayCount: (days: number) => `Day ${days} of your case`,
    fraudUrgent: {
      bannerTitle: 'Call 1930 now',
      bannerBodyRecent: 'Call 1930 now. The first hours matter most.',
      bannerBodyEarlier: 'Report today. The sooner the better.',
      callButton: 'Call 1930',
    },
    doThisNow: {
      title: 'Do this now',
      callButton: (phone: string) => `Call ${phone}`,
      websiteButton: 'Open official website',
      shareDraftButton: 'Share complaint draft',
      draftCopiedNotice: 'Draft ready to share',
    },
    callScript: {
      title: 'What to say on the call',
      subtitle: 'Read these plain lines directly to the helpline officer:',
    },
    evidence: {
      title: 'Evidence checklist',
      progress: (done: number, total: number) => `${done} of ${total} ready`,
      hint: 'Tap items you have collected. Having these ready strengthens your case.',
    },
    timeline: {
      title: 'Escalation timeline',
      inDays: (days: number) => `in ${days} day${days === 1 ? '' : 's'}`,
      overdue: 'Action needed now',
      currentBadge: 'Current step',
      completedBadge: 'Completed',
    },
    resolve: {
      button: 'Mark as resolved',
      cardTitle: 'Mark case as resolved',
      cardSubtitle: 'Congratulations! Did you get your money back?',
      amountLabel: 'Recovered amount (₹)',
      confirmButton: 'Confirm resolved',
      cancelButton: 'Cancel',
      resolvedBanner: (date: string, amount?: string) =>
        amount ? `Resolved on ${date} • Recovered ${amount}` : `Resolved on ${date}`,
    },
  },
  myCases: {
    title: 'My cases',
    subtitle: 'Track your ongoing and resolved complaints in one place.',
    inProgressSection: 'In progress',
    resolvedSection: 'Resolved',
    emptyTitle: 'No cases saved yet',
    emptySubtitle:
      'When you report a dispute or fraud, your case steps and progress will appear here.',
    startCaseButton: 'Start a case',
    daysOpen: (days: number) => `Day ${days}`,
    nextStep: (who: string, inDays: number) =>
      inDays === 0 ? `Today: ${who}` : `Next: ${who} in ${inDays}d`,
    overdueStep: (who: string) => `Escalate to: ${who}`,
    resolvedBadge: 'Resolved',
    recoveredBadge: (amount: string) => `Recovered ${amount}`,
  },
  moneyRadar: {
    title: 'Money radar',
    subtitle:
      'Search national records for deposits, matured policies, and pensions that were forgotten or left unclaimed.',
    framingNotice:
      'UDGAM covers participating banks only; it does not cover post office savings, PF, or insurance. We do not promise any recovered money.',
    deceasedNotice:
      'Claiming usually needs a death certificate and proof that you are the nominee or legal heir; check each place’s rules.',
    checkedCount: (checked: number, total: number) => `Checked ${checked} of ${total} places`,
    foundSoFar: (amount: string) => `Found so far: ${amount}`,
    receivedSoFar: (amount: string) => `Received: ${amount}`,
    saveUpdate: 'Save update',
    remindIn7Days: 'Remind me in 7 days to check again',
  },
  medicineSaver: {
    title: 'Medicine saver',
    subtitle: 'See what you spend on medicines and what you could save, and never miss a refill.',
    safetyNotice:
      'Generic and brand medicines can contain the same salt, but never switch or stop a medicine without asking your doctor or pharmacist first.',
    spendingMonthly: (amount: string) => `Spending ${amount} a month`,
    couldSaveMonthly: (amount: string) => `You could save ${amount} a month`,
    yearlyDifference: (amount: string) => `Difference across the year: ${amount}`,
    genericHelper: 'Look this up in the Jan Aushadhi Sugam app or ask your pharmacist',
    openJanAushadhi: 'Open Jan Aushadhi website',
    refillReminderText: (name: string) => `Time to check your refill of ${name}`,
  },
};
