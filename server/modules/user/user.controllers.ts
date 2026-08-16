import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { compare, genSalt, hash } from 'bcrypt';

import { signUserToken } from './user.auth';
import { UserRepository } from './user.repository';
import type { LoginDTO, RegisterUserDTO } from './user.dto';

function getSafeUser(user: { toJSON: () => unknown }) {
  return user.toJSON();
}

// este controlador crea una cuenta nueva y devuelve un token.
export async function registerUser(req: Request<{}, {}, RegisterUserDTO>, res: Response) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    const {
      name,
      lastName,
      email,
      password,
      phone,
      birthDate,
      address,
      role = 'normal',
      avatarUrl,
    } = req.body;
    const existingUser = await UserRepository.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({ msg: 'email already in use' });
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({ msg: 'birthDate is invalid' });
    }

    const createdUser = await UserRepository.createUser({
      name,
      lastName,
      email,
      password: hashedPassword,
      phone,
      birthDate: parsedBirthDate,
      address,
      role,
      avatarUrl,
    });

    const token = signUserToken({
      sub: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    });

    return res.status(201).json({
      msg: 'user registered successfully',
      user: getSafeUser(createdUser),
      token,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ msg: 'email or phone already in use' });
    }
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}

// este controlador valida credenciales y emite un token nuevo.
export async function loginUser(req: Request<{}, {}, LoginDTO>, res: Response) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: 'validation error',
        errors: errors.array(),
      });
    }

    const { user: loginUser, password } = req.body;
    const user = await UserRepository.findByLoginIdentifier(loginUser);

    if (!user || !user.password) {
      return res.status(401).json({ msg: 'invalid credentials' });
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ msg: 'invalid credentials' });
    }

    const token = signUserToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      msg: 'login successful',
      user: getSafeUser(user),
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'internal server error' });
  }
}
