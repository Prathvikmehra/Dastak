export const BASE_TAB_BAR_HEIGHT = 68;

export interface TabBarGeometry {
  height: number;
  paddingTop: number;
  paddingBottom: number;
}

export function getTabBarStyle(bottomInset: number): TabBarGeometry {
  const bottomPadding = bottomInset > 0 ? bottomInset + 4 : 8;
  const height = BASE_TAB_BAR_HEIGHT + (bottomInset > 0 ? bottomInset : 0);
  return {
    height,
    paddingTop: 8,
    paddingBottom: bottomPadding,
  };
}

export function getTabBarBottomPadding(bottomInset: number): number {
  return getTabBarStyle(bottomInset).paddingBottom;
}
