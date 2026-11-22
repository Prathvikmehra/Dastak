import { UiCommonCopy } from '../types/uiCommon';

export const hiUiCommon: UiCommonCopy = {
  appTitle: 'Dastak',
  tagline: 'आपके अधिकार, बचत और क्लेम एक ही जगह',

  tabs: {
    fix: 'समस्या हल करें',
    find: 'पैसे खोजें',
  },

  header: {
    helpAccessibility: 'मदद, सेटिंग्स और भाषा',
    closeAccessibility: 'सेटिंग्स बंद करें',
  },

  common: {
    ok: 'ठीक है',
    cancel: 'रद्द करें',
    save: 'सुरक्षित करें',
    delete: 'हटाएं',
    edit: 'बदलें',
    back: 'वापस',
    dot: '.',
    done: 'हो गया',
    today: 'आज',
    call: 'कॉल करें',
    website: 'वेबसाइट',
    share: 'शेयर करें',
    grievanceCase: 'शिकायत मामला',
    couldNotOpenDialer: (phone: string) => `फ़ोन डायलर नहीं खुल सका। आप सीधे कॉल कर सकते हैं: ${phone}`,
    couldNotOpenBrowser: (url: string) => `ब्राउज़र नहीं खुल सका। आप सीधे यहां जा सकते हैं: ${url}`,
  },

  unsavedChanges: {
    title: 'बिना सहेजे वापस जाएं?',
    message: 'आपके द्वारा दर्ज की गई जानकारी सहेजी नहीं जाएगी।',
    keepEditing: 'संपादन जारी रखें',
    leave: 'छोड़ें',
  },

  dateField: {
    today: 'आज',
    yesterday: 'कल',
    weekAgo: 'एक हफ़्ता पहले',
    pickDate: 'तारीख चुनें',
    dayLabel: 'दिन',
    monthLabel: 'माह',
    yearLabel: 'वर्ष',
    dayPlaceholder: 'DD',
    monthPlaceholder: 'MM',
    yearPlaceholder: 'YYYY',
    invalidError: 'यह तारीख सही नहीं लग रही है',
    legacySaved: 'पहले से सहेजी गई तारीख:',
  },
};
