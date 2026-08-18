import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';

// guarda los archivos en memoria para subirlos luego a cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 5,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('only image files are allowed'));
      return;
    }

    cb(null, true);
  },
});

const uploadPostImagesMiddleware = upload.array('images', 5);

// maneja multipart/form-data y devuelve errores claros.
export function handlePostImagesUpload(req: Request, res: Response, next: NextFunction) {
  uploadPostImagesMiddleware(req, res, (error?: unknown) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ msg: 'you can upload up to 5 images' });
      }

      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'each image must be smaller than 5 mb' });
      }

      return res.status(400).json({ msg: error.message });
    }

    const message = error instanceof Error ? error.message : 'invalid upload';
    return res.status(400).json({ msg: message });
  });
}

