import { AppReadyCoordinator } from './useAppReady';
import { logger } from './logger';

describe('AppReadyCoordinator', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    warnSpy.mockRestore();
  });

  it('all-ready hides once when all prerequisites are satisfied', () => {
    const hideSplash = jest.fn();
    const onHidden = jest.fn();
    const coordinator = new AppReadyCoordinator({ hideSplash, onHidden });

    // Not all ready initially
    const state = {
      isFontsReady: true,
      isPreferencesReady: true,
      isCasesReady: false,
      isMoneyReady: true,
      isMedicinesReady: true,
    };

    coordinator.startTimeout(() => state);
    coordinator.evaluate(state);

    expect(hideSplash).not.toHaveBeenCalled();
    expect(coordinator.isDismissed()).toBe(false);

    // Now cases store finishes hydrating
    state.isCasesReady = true;
    coordinator.evaluate(state);

    expect(hideSplash).toHaveBeenCalledTimes(1);
    expect(onHidden).toHaveBeenCalledTimes(1);
    expect(coordinator.isDismissed()).toBe(true);
    expect(coordinator.getHideCalls()).toBe(1);

    coordinator.cleanup();
  });

  it('timeout hides once and logs locally if prerequisites are not met within timeoutMs', () => {
    const hideSplash = jest.fn();
    const onTimeout = jest.fn();
    const coordinator = new AppReadyCoordinator({
      hideSplash,
      timeoutMs: 3000,
      onTimeout,
    });

    const state = {
      isFontsReady: true,
      isPreferencesReady: false,
      isCasesReady: true,
      isMoneyReady: false,
      isMedicinesReady: true,
    };

    coordinator.startTimeout(() => state);
    coordinator.evaluate(state);

    expect(hideSplash).not.toHaveBeenCalled();

    // Fast-forward 2999ms: still not timed out
    jest.advanceTimersByTime(2999);
    expect(hideSplash).not.toHaveBeenCalled();

    // Fast-forward past 3000ms: timeout fires
    jest.advanceTimersByTime(1);
    expect(hideSplash).toHaveBeenCalledTimes(1);
    expect(coordinator.isDismissed()).toBe(true);
    expect(coordinator.getHideCalls()).toBe(1);
    expect(onTimeout).toHaveBeenCalledWith(['preferences', 'money']);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Splash safety timeout reached after 3000ms. Unready: preferences, money'
      )
    );

    coordinator.cleanup();
  });

  it('failure still hides when store or preference load encounters an error state', () => {
    const hideSplash = jest.fn();
    const coordinator = new AppReadyCoordinator({ hideSplash });

    // When stores/preferences encounter an error, their loading ends (hasStorageError or fallback)
    // and they mark ready to allow the calm error boundary/banner to render
    const failedState = {
      isFontsReady: true,
      isPreferencesReady: true, // Failed load resolved to fallback language/theme
      isCasesReady: true, // Finished with hasStorageError: true
      isMoneyReady: true, // Finished with hadCorruptedData: true
      isMedicinesReady: true,
    };

    coordinator.startTimeout(() => failedState);
    coordinator.evaluate(failedState);

    expect(hideSplash).toHaveBeenCalledTimes(1);
    expect(coordinator.isDismissed()).toBe(true);
    expect(coordinator.getHideCalls()).toBe(1);

    coordinator.cleanup();
  });

  it('never hides twice: timeout after all-ready does not hide again', () => {
    const hideSplash = jest.fn();
    const coordinator = new AppReadyCoordinator({ hideSplash, timeoutMs: 3000 });

    const allReadyState = {
      isFontsReady: true,
      isPreferencesReady: true,
      isCasesReady: true,
      isMoneyReady: true,
      isMedicinesReady: true,
    };

    coordinator.startTimeout(() => allReadyState);
    coordinator.evaluate(allReadyState);

    expect(hideSplash).toHaveBeenCalledTimes(1);

    // Advance time past timeout
    jest.advanceTimersByTime(5000);
    expect(hideSplash).toHaveBeenCalledTimes(1);
    expect(coordinator.getHideCalls()).toBe(1);

    // Re-evaluating does nothing
    coordinator.evaluate(allReadyState);
    expect(hideSplash).toHaveBeenCalledTimes(1);

    coordinator.cleanup();
  });

  it('never hides twice: all-ready after timeout does not hide again', () => {
    const hideSplash = jest.fn();
    const coordinator = new AppReadyCoordinator({ hideSplash, timeoutMs: 3000 });

    const pendingState = {
      isFontsReady: false,
      isPreferencesReady: false,
      isCasesReady: false,
      isMoneyReady: false,
      isMedicinesReady: false,
    };

    coordinator.startTimeout(() => pendingState);
    coordinator.evaluate(pendingState);

    // Advance time to trigger timeout hide
    jest.advanceTimersByTime(3000);
    expect(hideSplash).toHaveBeenCalledTimes(1);

    // Now everything becomes ready after the timeout has already hidden splash
    const readyState = {
      isFontsReady: true,
      isPreferencesReady: true,
      isCasesReady: true,
      isMoneyReady: true,
      isMedicinesReady: true,
    };
    coordinator.evaluate(readyState);

    expect(hideSplash).toHaveBeenCalledTimes(1);
    expect(coordinator.getHideCalls()).toBe(1);

    coordinator.cleanup();
  });
});
