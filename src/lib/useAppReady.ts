import { useEffect, useRef, useState, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { logger } from './logger';

export interface AppReadinessProps {
  isFontsReady: boolean;
  isPreferencesReady: boolean;
  isCasesReady: boolean;
  isMoneyReady: boolean;
  isMedicinesReady: boolean;
}

export interface UseAppReadyOptions extends AppReadinessProps {
  hideSplash?: () => Promise<void> | void;
  timeoutMs?: number;
  onHidden?: () => void;
  onTimeout?: (unready: string[]) => void;
}

/**
 * Pure state machine coordinator for app readiness and splash screen dismissal.
 * Can be tested in isolation with fake clocks and fake hideSplash functions.
 */
export class AppReadyCoordinator {
  private hasHidden = false;
  private hideCalls = 0;
  private readonly hideSplash: () => Promise<void> | void;
  private readonly timeoutMs: number;
  private readonly onHidden?: () => void;
  private readonly onTimeout?: (unready: string[]) => void;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    options: {
      hideSplash?: () => Promise<void> | void;
      timeoutMs?: number;
      onHidden?: () => void;
      onTimeout?: (unready: string[]) => void;
    } = {}
  ) {
    this.hideSplash = options.hideSplash || (() => SplashScreen.hideAsync());
    this.timeoutMs = options.timeoutMs ?? 3000;
    this.onHidden = options.onHidden;
    this.onTimeout = options.onTimeout;
  }

  public startTimeout(getCurrentState: () => AppReadinessProps): void {
    if (this.hasHidden || this.timer !== null) return;

    this.timer = setTimeout(() => {
      if (this.hasHidden) return;
      const state = getCurrentState();
      const unready: string[] = [];
      if (!state.isFontsReady) unready.push('fonts');
      if (!state.isPreferencesReady) unready.push('preferences');
      if (!state.isCasesReady) unready.push('cases');
      if (!state.isMoneyReady) unready.push('money');
      if (!state.isMedicinesReady) unready.push('medicines');

      logger.warn(
        `Splash safety timeout reached after ${this.timeoutMs}ms. Unready: ${unready.join(', ') || 'none'}`
      );
      if (this.onTimeout) {
        this.onTimeout(unready);
      }
      this.dismiss();
    }, this.timeoutMs);
  }

  public evaluate(state: AppReadinessProps): boolean {
    const isAllReady =
      state.isFontsReady &&
      state.isPreferencesReady &&
      state.isCasesReady &&
      state.isMoneyReady &&
      state.isMedicinesReady;

    if (isAllReady && !this.hasHidden) {
      this.dismiss();
    }

    return this.hasHidden;
  }

  public dismiss(): void {
    if (this.hasHidden) return;
    this.hasHidden = true;
    this.hideCalls += 1;

    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      const res = this.hideSplash();
      if (res && typeof (res as Promise<void>).catch === 'function') {
        (res as Promise<void>).catch((err) => {
          logger.warn('Failed executing hideSplash asynchronously', err);
        });
      }
    } catch (err) {
      logger.warn('Failed calling hideSplash synchronously', err);
    }

    if (this.onHidden) {
      this.onHidden();
    }
  }

  public isDismissed(): boolean {
    return this.hasHidden;
  }

  public getHideCalls(): number {
    return this.hideCalls;
  }

  public cleanup(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * Hook to manage app readiness and hide the native splash screen safely.
 */
export function useAppReady({
  isFontsReady,
  isPreferencesReady,
  isCasesReady,
  isMoneyReady,
  isMedicinesReady,
  hideSplash,
  timeoutMs = 3000,
  onHidden,
  onTimeout,
}: UseAppReadyOptions): { isReady: boolean } {
  const [isDismissed, setIsDismissed] = useState(false);

  const stateRef = useRef<AppReadinessProps>({
    isFontsReady,
    isPreferencesReady,
    isCasesReady,
    isMoneyReady,
    isMedicinesReady,
  });

  const handleHidden = useCallback(() => {
    setIsDismissed(true);
    if (onHidden) onHidden();
  }, [onHidden]);

  const [coordinator] = useState(
    () =>
      new AppReadyCoordinator({
        hideSplash,
        timeoutMs,
        onHidden: handleHidden,
        onTimeout,
      })
  );

  useEffect(() => {
    stateRef.current = {
      isFontsReady,
      isPreferencesReady,
      isCasesReady,
      isMoneyReady,
      isMedicinesReady,
    };

    coordinator.startTimeout(() => stateRef.current);
    coordinator.evaluate({
      isFontsReady,
      isPreferencesReady,
      isCasesReady,
      isMoneyReady,
      isMedicinesReady,
    });

    return () => {
      coordinator.cleanup();
    };
  }, [coordinator, isFontsReady, isPreferencesReady, isCasesReady, isMoneyReady, isMedicinesReady]);

  return { isReady: isDismissed };
}
