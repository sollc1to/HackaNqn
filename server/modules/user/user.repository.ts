import UserModel from './user.model';

import type { RegisterUserDTO } from './user.dto';
import type { UserDocument } from './user.types';

type CreateUserInput = Omit<RegisterUserDTO, 'birthDate'> & {
  birthDate: Date;
  password: string;
};

export const UserRepository = {
  // este metodo busca un usuario por email sin exponer la clave.
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await UserModel.findOne({ email });
  },

  // este metodo busca un usuario por email o telefono.
  async findByLoginIdentifier(identifier: string): Promise<UserDocument | null> {
    const normalizedIdentifier = identifier.trim().toLowerCase();

    return await UserModel.findOne({
      $or: [{ email: normalizedIdentifier }, { phone: identifier.trim() }],
    }).select('+password');
  },

  // este metodo busca un usuario por id.
  async findById(id: string): Promise<UserDocument | null> {
    return await UserModel.findById(id);
  },

  // este metodo crea un usuario nuevo en la coleccion.
  async createUser(data: CreateUserInput) {
    const newUser = new UserModel(data);
    return await newUser.save();
  },
};
