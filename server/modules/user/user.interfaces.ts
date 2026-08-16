// roles disponibles para usuarios de la app.
export type UserRole = 'normal' | 'organizacion' | 'administrador';

// estructura base del usuario almacenado en mongo.
export interface User {
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  birthDate: Date;
  address: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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

// salida limpia que se devuelve al cliente.
export interface SafeUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string;
  birthDate: string;
  address: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// payload interno del jwt de autenticacion.
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
