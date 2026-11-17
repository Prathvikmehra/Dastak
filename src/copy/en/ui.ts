import { UiCopy } from '../types/ui';
import { enUiCommon } from './uiCommon';
import { enUiCases } from './uiCases';
import { enUiFind } from './uiFind';

export const enUi: UiCopy = {
  ...enUiCommon,
  ...enUiCases,
  ...enUiFind,
};
