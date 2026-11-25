export interface UiCommonCopy {
  appTitle: string;
  tagline: string;
  tabs: { fix: string; find: string };
  header: { helpAccessibility: string; closeAccessibility: string };
  common: {
    ok: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    dot: string;
    done: string;
    today: string;
    call: string;
    website: string;
    share: string;
    grievanceCase: string;
    couldNotOpenDialer: (phone: string) => string;
    couldNotOpenBrowser: (url: string) => string;
  };
  unsavedChanges: {
    title: string;
    message: string;
    keepEditing: string;
    leave: string;
  };
  dateField: {
    today: string;
    yesterday: string;
    weekAgo: string;
    pickDate: string;
    dayLabel: string;
    monthLabel: string;
    yearLabel: string;
    dayPlaceholder: string;
    monthPlaceholder: string;
    yearPlaceholder: string;
    invalidError: string;
    legacySaved: string;
  };
  errorBoundary: {
    message: string;
    tryAgain: string;
  };
}
