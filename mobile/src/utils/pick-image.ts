import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export type PickedImage = {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
};

export type PickImageSource = 'camera' | 'library';

async function loadImagePicker() {
  try {
    // Loading lazily prevents an older native build from crashing the whole app
    // before the user opens the camera or the image library.
    return await import('expo-image-picker');
  } catch {
    throw new Error('image-picker-unavailable');
  }
}

async function optimizeAsset(asset: ImagePickerAsset): Promise<PickedImage> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return { uri: asset.uri, width: asset.width, height: asset.height, fileSize: asset.fileSize };
  }

  const image = document.createElement('img');
  image.src = asset.uri;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('image-compression'));
  });
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / Math.max(1, image.naturalWidth));
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('image-compression');
  context.drawImage(image, 0, 0, width, height);
  const uri = canvas.toDataURL('image/jpeg', 0.72);
  URL.revokeObjectURL(asset.uri);
  return { uri, width, height, fileSize: Math.round((uri.length * 3) / 4) };
}

export async function pickImages(source: PickImageSource, multiple = false): Promise<PickedImage[]> {
  const ImagePicker = await loadImagePicker();

  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error('camera-permission');

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.72,
    });

    if (result.canceled) return [];
    return Promise.all(result.assets.map(optimizeAsset));
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('library-permission');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    selectionLimit: multiple ? 5 : 1,
    orderedSelection: true,
    quality: 0.72,
  });

  if (result.canceled) return [];
  return Promise.all(result.assets.map(optimizeAsset));
}

export async function pickImage(source: PickImageSource = 'library') {
  const images = await pickImages(source, false);
  return images[0]?.uri;
}

export function getPickImageErrorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  switch (code) {
    case 'camera-permission':
      return 'Necesitamos permiso de cámara para tomar la foto.';
    case 'library-permission':
      return 'Necesitamos permiso para acceder a la biblioteca.';
    case 'image-picker-unavailable':
      return 'Esta instalación debe actualizarse para usar la cámara o la biblioteca.';
    case 'image-compression':
      return 'No pudimos procesar la imagen seleccionada.';
    default:
      return 'No pudimos abrir el selector de imágenes. Intentá nuevamente.';
  }
}
