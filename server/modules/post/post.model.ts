import mongoose from 'mongoose';

import type { Post } from './post.interfaces';

// subesquema para cada imagen del post.
const postImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
  },
  { _id: false },
);

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
    // imagenes del post, minimo una y maximo cinco.
    images: {
      type: [postImageSchema],
      required: true,
      validate: {
        validator: (value: unknown[]) => Array.isArray(value) && value.length >= 1 && value.length <= 5,
        message: 'images must contain between 1 and 5 items',
      },
    },
    // categoria tematica para filtrar en la busqueda.
    category: {
      type: String,
      enum: ['food', 'clothes', 'health', 'home', 'school', 'furniture', 'volunteering'],
    },
    // condicion del articulo publicado.
    condition: {
      type: String,
      enum: ['new', 'very-good', 'good'],
    },
    // forma de entrega acordada.
    delivery: {
      type: String,
      enum: ['coordinate', 'can-deliver'],
      default: 'coordinate',
    },
    // ubicacion geografica para filtrar y ordenar por distancia.
    location: {
      label: {
        type: String,
        trim: true,
        maxlength: 120,
      },
      locality: {
        type: String,
        trim: true,
        maxlength: 80,
      },
      neighborhood: {
        type: String,
        trim: true,
        maxlength: 80,
      },
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
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
