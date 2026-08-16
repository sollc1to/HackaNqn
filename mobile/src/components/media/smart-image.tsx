import { useEffect, useState } from 'react';
import { Image, type ImageProps, type ImageSource } from 'expo-image';

import { fallbackPostImage } from '@/data/posts';

type SmartImageProps = Omit<ImageProps, 'source'> & {
  source: ImageSource;
  fallbackSource?: ImageSource;
};

export function SmartImage({ source, fallbackSource = fallbackPostImage, ...props }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const sourceKey = typeof source === 'object' && source && 'uri' in source ? source.uri : String(source);

  useEffect(() => setFailed(false), [sourceKey]);

  return (
    <Image
      {...props}
      source={failed ? fallbackSource : source}
      onError={() => setFailed(true)}
      recyclingKey={sourceKey}
    />
  );
}
