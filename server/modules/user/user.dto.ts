import type { UserRole } from './user.interfaces';

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

export interface LoginDTO {
  user: string;
  password: string;
}

