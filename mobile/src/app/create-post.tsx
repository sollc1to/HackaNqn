import { Stack } from 'expo-router';

import { CreatePostView } from '@/views/posts/create-post-view';

// esta ruta expone el formulario para crear una nueva publicacion.
export default function CreatePostRoute() {
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <CreatePostView />
    </>
  );
}
