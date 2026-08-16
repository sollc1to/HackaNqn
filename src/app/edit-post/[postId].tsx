import { Stack } from 'expo-router';

import { CreatePostView } from '@/views/posts/create-post-view';

export default function EditPostScreen() {
  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <CreatePostView />
    </>
  );
}
