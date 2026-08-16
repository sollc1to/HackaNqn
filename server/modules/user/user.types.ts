import type { HydratedDocument } from 'mongoose';

import type { User } from './user.interfaces';

// este tipo representa un documento de mongoose del usuario.
export type UserDocument = HydratedDocument<User>;
