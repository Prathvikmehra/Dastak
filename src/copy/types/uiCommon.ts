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
  };
  dateField: {
    today: string;
    yesterday: string;
    weekAgo: string;
    pickDate: string;
    dayPlaceholder: string;
    monthPlaceholder: string;
    yearPlaceholder: string;
    invalidError: string;
    legacySaved: string;
  };
}
