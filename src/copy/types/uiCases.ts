import { IssueType } from '../../features/cases/types';

export interface UiCasesCopy {
  fixHome: {
    title: string;
    subtitle: string;
    boxTitle: string;
    boxSubtitle: string;
    boxPlaceholder: string;
    commonProblemsHeading: string;
    refundCard: string;
    fraudCard: string;
    bankCard: string;
    insuranceCard: string;
    myCasesLink: string;
    emptyTitle: string;
    emptyMessage: string;
    arrowAccessibility: string;
    activeCasesHeading: string;
    summaryTitle: (count: number) => string;
    viewMyCases: string;
    recoveredBanner: (amount: string) => string;
    findDoorButton: string;
    urgentActionNeeded: (who: string) => string;
    urgentToday: (who: string) => string;
    urgentNextInDays: (who: string, days: number) => string;
    urgentNext: (who: string) => string;
    fraudShortcut: {
      prompt: string;
      callButton: string;
      saveLink: string;
    };
    doors: Record<IssueType, { title: string; subtitle: string }>;
  };
  newCase: {
    title: string;
    subtitle: string;
    issueTypeLabel: string;
    companyLabel: string;
    companyPlaceholder: string;
    amountLabel: string;
    amountPlaceholder: string;
    amountHelper: string;
    referenceLabel: string;
    referencePlaceholder: string;
    incidentDateLabel: string;
    incidentDatePlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    userNameLabel: string;
    userNamePlaceholder: string;
    saveButton: string;
    savingButton: string;
    referenceHelper: string;
    issueRequired: string;
    fraudWhenLabel: string;
    fraudWhenHour: string;
    fraudWhenToday: string;
    fraudWhenYesterday: string;
    fraudWhenEarlier: string;
    fraudBannerUrgent: string;
    fraudBannerEarlier: string;
    fieldHelperRefundRef: string;
    fieldHelperFraudRef: string;
    fieldHelperBankRef: string;
    fieldHelperInsuranceRef: string;
    amountPreview: (formatted: string) => string;
    routedGuess: (issue: string) => string;
    changeChoice: string;
    noGuessPickBest: string;
    twoCandidatesStrip: (doorA: string, doorB: string) => string;
    call1930Advice: string;
    fieldLabels: Record<
      IssueType,
      {
        company: string;
        companyPlaceholder: string;
        reference: string;
        referencePlaceholder: string;
      }
    >;
    fraudTiming: {
      label: string;
      hour: string;
      today: string;
      yesterday: string;
      earlier: string;
    };
  };
  caseDetail: {
    title: string;
    evidenceHeading: string;
    timelineHeading: string;
    resolveHeading: string;
    emptyTitle: string;
    emptyMessage: string;
    dayCount: (days: number) => string;
    daysCount: (days: number) => string;
    draftButton: string;
    callButton: string;
    resolveButton: string;
    shareButton: string;
    evidenceDoneCount: (done: number, total: number) => string;
    noticeDialFailed: (phone: string) => string;
    noticeLinkFailed: (url: string) => string;
    refLabel: (ref: string) => string;
    fraudUrgent: {
      bannerTitle: string;
      bannerBodyRecent: string;
      bannerBodyEarlier: string;
      callButton: string;
    };
    doThisNow: {
      title: string;
      callButton: (phone: string) => string;
      websiteButton: string;
      openCmsRbiButton: string;
      shareDraftButton: string;
      draftCopiedNotice: string;
    };
    callScript: {
      title: string;
      subtitle: string;
    };
    evidence: {
      title: string;
      progress: (done: number, total: number) => string;
      hint: string;
    };
    timeline: {
      title: string;
      inDays: (days: number) => string;
      overdue: string;
      currentBadge: string;
      completedBadge: string;
    };
    resolve: {
      button: string;
      cardTitle: string;
      cardSubtitle: string;
      amountLabel: string;
      helper: string;
      markResolved: string;
      recoveredAmountLabel: string;
      recoveredAmountPlaceholder: string;
      confirmButton: string;
      resolvingButton: string;
      cancelButton: string;
      resolvedBanner: (date: string, amount?: string) => string;
    };
  };
  myCases: {
    title: string;
    subtitle: string;
    inProgressSection: string;
    resolvedSection: string;
    emptyTitle: string;
    emptySubtitle: string;
    emptyMessage: string;
    startCaseButton: string;
    daysOpen: (days: number) => string;
    nextStep: (who: string, inDays: number) => string;
    overdueStep: (who: string) => string;
    resolvedBadge: string;
    recoveredBadge: (amount: string) => string;
    recoveredTotal: (amount: string) => string;
    activeCount: (count: number) => string;
    resolvedCount: (count: number) => string;
  };
  caseCard: {
    resolvedAccessibility: (company: string) => string;
    activeStep: (who: string) => string;
    caseAccessibility: (company: string, amount: string) => string;
    unknownCompany: string;
  };
  reminders: {
    notificationTitle: (who: string) => string;
    bodyMovesToday: (company: string, who: string) => string;
  };
}
