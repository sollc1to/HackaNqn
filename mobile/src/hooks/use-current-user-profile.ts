import { useEffect, useState } from 'react';

import { appAuthors, currentUserId } from '@/data/authors';
import { backendUserToAuthor, fetchCurrentBackendUser } from '@/lib/backend-api';
import { getStoredAuthToken, getStoredAuthUser } from '@/lib/auth-storage';

import type { AppAuthor } from '@/data/authors';

type CurrentProfileState = {
  profile: AppAuthor;
  isLoading: boolean;
  error: string;
  source: 'backend' | 'stored-session' | 'mock';
};

export function useCurrentUserProfile(): CurrentProfileState {
  const [state, setState] = useState<CurrentProfileState>(() => ({
    profile: appAuthors.find(author => author.id === currentUserId) ?? appAuthors[0],
    isLoading: true,
    error: '',
    source: 'mock',
  }));

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const token = await getStoredAuthToken();
      const storedUser = await getStoredAuthUser();

      if (!token && storedUser) {
        if (!active) return;
        setState({
          profile: backendUserToAuthor(storedUser),
          isLoading: false,
          error: '',
          source: 'stored-session',
        });
        return;
      }

      if (!token) {
        const fallbackProfile = appAuthors.find(author => author.id === currentUserId) ?? appAuthors[0];
        if (!active) return;
        setState({
          profile: fallbackProfile,
          isLoading: false,
          error: '',
          source: 'mock',
        });
        return;
      }

      try {
        const backendUser = await fetchCurrentBackendUser(token);
        if (!active) return;

        setState({
          profile: backendUserToAuthor(backendUser),
          isLoading: false,
          error: '',
          source: 'backend',
        });
      } catch {
        const fallbackProfile = storedUser
          ? backendUserToAuthor(storedUser)
          : appAuthors.find(author => author.id === currentUserId) ?? appAuthors[0];

        if (!active) return;

        setState({
          profile: fallbackProfile,
          isLoading: false,
          error: 'No pudimos sincronizar el perfil con el servidor. Mostramos la última versión disponible.',
          source: storedUser ? 'stored-session' : 'mock',
        });
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
