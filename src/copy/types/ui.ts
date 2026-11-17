import { UiCommonCopy } from './uiCommon';
import { UiCasesCopy } from './uiCases';
import { UiFindCopy } from './uiFind';

export interface UiCopy extends UiCommonCopy, UiCasesCopy, UiFindCopy {}

export * from './uiCommon';
export * from './uiCases';
export * from './uiFind';
