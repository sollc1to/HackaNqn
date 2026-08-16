import mongoose from 'mongoose';

import type { User } from './user.interfaces';

// este esquema guarda la informacion base de acceso y perfil.
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

// este transform elimina datos sensibles y expone un id amigable.
userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    ret.birthDate = new Date(ret.birthDate).toISOString();
    return ret;
  },
});

// este modelo representa la coleccion users.
const UserModel = mongoose.model('User', userSchema);

export default UserModel;
