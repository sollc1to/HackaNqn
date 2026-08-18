import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';
import 'dotenv/config';

// configura cloudinary usando el url unico del entorno.
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (!cloudinaryUrl) {
  throw new Error('missing CLOUDINARY_URL environment variable');
}

const parsedCloudinaryUrl = new URL(cloudinaryUrl);

cloudinary.config({
  cloud_name: parsedCloudinaryUrl.hostname,
  api_key: parsedCloudinaryUrl.username,
  api_secret: parsedCloudinaryUrl.password,
  secure: true,
});

export interface UploadedPostImage {
  url: string;
  publicId: string;
}

// sube una imagen a cloudinary y devuelve sus metadatos publicos.
export function uploadPostImage(file: Express.Multer.File, folder = 'hackanqn/posts') {
  return new Promise<UploadedPostImage>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('cloudinary upload failed'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

// elimina una imagen de cloudinary por public id.
export async function deletePostImage(publicId: string) {
  return await cloudinary.uploader.destroy(publicId);
}
