import React, { useEffect } from 'react';
import { Alert } from 'react-native';

export interface NavigationGuard {
  addListener: (
    event: 'beforeRemove',
    listener: (e: { preventDefault: () => void; data: { action: unknown } }) => void
  ) => () => void;
  dispatch: (action: unknown) => void;
}

export function useMedicineFormGuard({
  navigation,
  isDirty,
  isSubmitting,
  hasSavedRef,
  unsavedTitle,
  unsavedMessage,
  keepEditingText,
  leaveText,
}: {
  navigation?: NavigationGuard;
  isDirty: boolean;
  isSubmitting: boolean;
  hasSavedRef: React.MutableRefObject<boolean>;
  unsavedTitle: string;
  unsavedMessage: string;
  keepEditingText: string;
  leaveText: string;
}) {
  useEffect(() => {
    if (!navigation?.addListener) return;
    return navigation.addListener('beforeRemove', (e) => {
      if (!isDirty || isSubmitting || hasSavedRef.current) return;
      e.preventDefault();
      Alert.alert(unsavedTitle, unsavedMessage, [
        { text: keepEditingText, style: 'cancel' },
        {
          text: leaveText,
          style: 'destructive',
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
  }, [
    navigation,
    isDirty,
    isSubmitting,
    hasSavedRef,
    unsavedTitle,
    unsavedMessage,
    keepEditingText,
    leaveText,
  ]);
}
