import { UiCommonCopy } from '../types/uiCommon';

export const guUiCommon: UiCommonCopy = {
  appTitle: 'Dastak',
  tagline: 'તમારા અધિકાર, બચત અને ક્લેમ એક જ જગ્યાએ',

  tabs: {
    fix: 'સમસ્યા ઉકેલો',
    find: 'પૈસા શોધો',
  },

  header: {
    helpAccessibility: 'મદદ, સેટિંગ્સ અને ભાષા',
    closeAccessibility: 'સેટિંગ્સ બંધ કરો',
  },

  common: {
    ok: 'બરાબર',
    cancel: 'રદ કરો',
    save: 'સાચવો',
    delete: 'કાઢી નાખો',
    edit: 'ફેરફાર કરો',
    back: 'પાછા જાઓ',
    dot: '.',
    done: 'પૂર્ણ થયું',
    today: 'આજે',
    call: 'કૉલ કરો',
    website: 'વેબસાઇટ',
    share: 'શેર કરો',
    grievanceCase: 'ફરિયાદ કેસ',
    couldNotOpenDialer: (phone: string) =>
      `ફોન ડાયલર ખોલી શકાયું નથી. તમે સીધો કૉલ કરી શકો છો: ${phone}`,
    couldNotOpenBrowser: (url: string) => `બ્રાઉઝર ખોલી શકાયું નથી. તમે સીધી મુલાકાત લઈ શકો છો: ${url}`,
  },

  unsavedChanges: {
    title: 'સાચવ્યા વગર પાછા જવું છે?',
    message: 'તમે દાખલ કરેલી વિગતો સાચવવામાં આવશે નહીં.',
    keepEditing: 'ફેરફાર ચાલુ રાખો',
    leave: 'છોડો',
  },

  dateField: {
    today: 'આજે',
    yesterday: 'ગઈકાલે',
    weekAgo: 'એક અઠવાડિયા પહેલા',
    pickDate: 'તારીખ પસંદ કરો',
    dayLabel: 'દિવસ',
    monthLabel: 'મહિનો',
    yearLabel: 'વર્ષ',
    dayPlaceholder: 'DD',
    monthPlaceholder: 'MM',
    yearPlaceholder: 'YYYY',
    invalidError: 'આ તારીખ યોગ્ય લાગતી નથી',
    legacySaved: 'પહેલાથી સંગ્રહિત તારીખ:',
  },

  errorBoundary: {
    message: 'કંઈક ખોટું થયું. તમારા સાચવેલા કેસ આ ફોન પર સુરક્ષિત છે.',
    tryAgain: 'ફરી પ્રયાસ કરો',
  },

  verification: {
    checkedOn: (date: string) => `સંપર્ક વિગતો ${date} ના રોજ ચકાસવામાં આવી`,
    notCheckedYet: 'હજુ સુધી ચકાસાયેલ નથી. કૃપા કરીને સત્તાવાર સાઇટ પર પુષ્ટિ કરો.',
  },
};
