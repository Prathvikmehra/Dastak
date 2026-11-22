import { getTabBarStyle, BASE_TAB_BAR_HEIGHT } from './tab-bar';

describe('Tab bar geometry & safe-area calculations', () => {
  it('handles 3-button navigation (0 bottom inset) without double padding', () => {
    const style = getTabBarStyle(0);
    expect(style.height).toBe(BASE_TAB_BAR_HEIGHT);
    expect(style.paddingTop).toBe(8);
    expect(style.paddingBottom).toBe(8);

    const contentBoxHeight = style.height - style.paddingTop - style.paddingBottom;
    // Must be >= 48dp touch target and enough for 24dp icon + label at large font scale
    expect(contentBoxHeight).toBe(52);
    expect(contentBoxHeight).toBeGreaterThanOrEqual(48);
  });

  it('handles gesture navigation with 34dp bottom inset (iOS home indicator)', () => {
    const style = getTabBarStyle(34);
    expect(style.height).toBe(BASE_TAB_BAR_HEIGHT + 34);
    expect(style.paddingTop).toBe(8);
    expect(style.paddingBottom).toBe(38);

    const contentBoxHeight = style.height - style.paddingTop - style.paddingBottom;
    expect(contentBoxHeight).toBe(56);
    expect(contentBoxHeight).toBeGreaterThanOrEqual(48);
  });

  it('handles Android gesture navigation with 24dp bottom inset', () => {
    const style = getTabBarStyle(24);
    expect(style.height).toBe(BASE_TAB_BAR_HEIGHT + 24);
    expect(style.paddingTop).toBe(8);
    expect(style.paddingBottom).toBe(28);

    const contentBoxHeight = style.height - style.paddingTop - style.paddingBottom;
    expect(contentBoxHeight).toBe(56);
    expect(contentBoxHeight).toBeGreaterThanOrEqual(48);
  });
});
