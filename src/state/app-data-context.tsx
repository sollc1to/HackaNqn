import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

import { appPosts, type AppPost } from '@/data/posts';

type AppDataContextValue = {
  posts: AppPost[];
  addPost: (post: AppPost) => void;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState(appPosts);

  const value = useMemo(
    () => ({
      posts,
      // La nueva publicación se agrega al comienzo para que sea visible al instante.
      addPost: (post: AppPost) => setPosts(current => [post, ...current]),
    }),
    [posts],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData debe usarse dentro de AppDataProvider');
  }

  return context;
}
