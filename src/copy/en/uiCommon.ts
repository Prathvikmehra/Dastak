import { UiCommonCopy } from '../types/uiCommon';

export const enUiCommon: UiCommonCopy = {
  appTitle: 'Dastak',
  tagline: 'Your rights, savings, and claims in one place',

  tabs: {
    fix: 'Fix',
    find: 'Find',
  },

  header: {
    helpAccessibility: 'Help, settings, and language',
    closeAccessibility: 'Close settings modal',
  },

  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    dot: '.',
    done: 'Done',
    today: 'Today',
    call: 'Call',
    website: 'Website',
    share: 'Share',
    grievanceCase: 'Grievance Case',
    couldNotOpenDialer: (phone: string) =>
      `Could not open phone dialer. You can call directly: ${phone}`,
    couldNotOpenBrowser: (url: string) => `Could not open browser. You can visit directly: ${url}`,
  },

  unsavedChanges: {
    title: 'Leave without saving?',
    message: 'Any information you entered will not be saved.',
    keepEditing: 'Keep editing',
    leave: 'Leave',
  },

  dateField: {
    today: 'Today',
    yesterday: 'Yesterday',
    weekAgo: 'A week ago',
    pickDate: 'Pick a date',
    dayLabel: 'DD',
    monthLabel: 'MM',
    yearLabel: 'YYYY',
    dayPlaceholder: 'DD',
    monthPlaceholder: 'MM',
    yearPlaceholder: 'YYYY',
    invalidError: 'That date does not look right',
    legacySaved: 'Saved date from earlier:',
  },

  errorBoundary: {
    message: 'Something went wrong. Your saved cases are safe on this phone.',
    tryAgain: 'Try again',
  },
};
