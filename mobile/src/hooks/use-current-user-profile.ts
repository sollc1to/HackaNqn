import { useEffect, useState } from 'react';

import { backendUserToAuthor, fetchCurrentBackendUser } from '@/lib/backend-api';
import { getStoredAuthToken, getStoredAuthUser } from '@/lib/auth-storage';
import type { AppAuthor } from '@/data/authors';

type CurrentProfileState = {
  profile?: AppAuthor;
  isLoading: boolean;
  error: string;
  source: 'backend' | 'stored-session' | 'empty';
};

export function useCurrentUserProfile(): CurrentProfileState {
  const [state, setState] = useState<CurrentProfileState>(() => ({
    profile: undefined,
    isLoading: true,
    error: '',
    source: 'empty',
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
        if (!active) return;
        setState({
          profile: undefined,
          isLoading: false,
          error: 'No hay una sesión iniciada.',
          source: 'empty',
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
        if (!active) return;

        setState({
          profile: storedUser ? backendUserToAuthor(storedUser) : undefined,
          isLoading: false,
          error: storedUser ? 'No pudimos sincronizar el perfil con el servidor. Mostramos la última versión disponible.' : 'No pudimos sincronizar el perfil con el servidor.',
          source: storedUser ? 'stored-session' : 'empty',
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
