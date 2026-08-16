import mongoose from 'mongoose';

import type { User } from './user.interfaces';

// guarda la informacion base de acceso y perfil.
const userSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['normal', 'organizacion', 'administrador'],
      default: 'normal',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// elimina datos sensibles y expone un id amigable.
userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    // normaliza el id para el frontend.
    ret.id = ret._id;
    // oculta campos internos de mongoose.
    delete ret._id;
    delete ret.__v;
    // nunca expone la clave.
    delete ret.password;
    // serializa la fecha de nacimiento como string.
    ret.birthDate = new Date(ret.birthDate).toISOString();
    return ret;
  },
});

// representa la coleccion users.
const UserModel = mongoose.model('User', userSchema);

export default UserModel;
