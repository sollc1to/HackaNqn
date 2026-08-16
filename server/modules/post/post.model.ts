import mongoose from 'mongoose';

import type { Post } from './post.interfaces';

// esquema de publicaciones con ofertas y solicitudes.
const postSchema = new mongoose.Schema<Post>(
  {
    // titulo corto de la publicacion.
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    // descripcion principal de la publicacion.
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    // define si es una donacion o una solicitud.
    kind: {
      type: String,
      required: true,
      enum: ['donation', 'request'],
    },
    // ubicacion aproximada para mostrar en la app.
    locationApprox: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    // estado actual de la publicacion.
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'paused'],
      default: 'available',
    },
    // etiquetas para filtrar y clasificar contenido.
    tags: {
      type: [String],
      default: [],
      set: (value: string[]) =>
        value.map(tag => String(tag).trim().toLowerCase()).filter(Boolean).slice(0, 10),
    },
    // id del usuario que creo la publicacion.
    authorId: {
      type: String,
      required: true,
    },
    // fecha de publicacion visible para la app.
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// limpia el documento antes de devolverlo como json.
postSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    // expone un id simple en lugar de _id.
    ret.id = ret._id;
    // elimina campos internos de mongoose.
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// modelo principal de publicaciones.
const PostModel = mongoose.model('Post', postSchema);

export default PostModel;
