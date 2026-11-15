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
  },
  caseDetail: {
    dayCount: (days: number) => `Day ${days} of your case`,
    fraudUrgent: {
      bannerTitle: 'Call 1930 now',
      bannerBody:
        'Reporting financial fraud within 24 hours gives police the best chance to freeze the money.',
      callButton: 'Call 1930',
    },
    doThisNow: {
      title: 'Do this now',
      callButton: (phone: string) => `Call ${phone}`,
      websiteButton: 'Open official website',
      shareDraftButton: 'Share complaint draft',
      draftCopiedNotice: 'Draft ready to share',
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
};
