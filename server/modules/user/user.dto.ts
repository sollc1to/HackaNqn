import type { UserRole } from './user.interfaces';

// datos necesarios para registrar un usuario nuevo.
export interface RegisterUserDTO {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  address: string;
  role?: UserRole;
  avatarUrl?: string;
}

// datos necesarios para iniciar sesion.
export interface LoginDTO {
  user: string;
  password: string;
}
