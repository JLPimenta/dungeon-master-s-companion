import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTheme } from 'next-themes';
import type { UserPreferences } from '@/types/auth';
import { DEFAULT_PREFERENCES } from '@/types/auth';

export function useUserPreferences() {
  const { user, updatePreferences: updateAuthPreferences } = useAuth();
  const { setTheme } = useTheme();

  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...(user?.preferences || {}),
  };

  const updatePreferences = useCallback(
    async (patch: Partial<UserPreferences>) => {
      // Optimistically apply theme change if it's in the patch
      if (patch.theme) {
        setTheme(patch.theme);
      }
      
      // Persist to backend (or localStorage via localAuthService)
      await updateAuthPreferences(patch);
    },
    [updateAuthPreferences, setTheme]
  );

  return {
    preferences,
    updatePreferences,
    autoSaveEnabled: preferences.autoSave,
    currentTheme: preferences.theme,
  };
}
