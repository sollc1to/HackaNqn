import type { HydratedDocument } from 'mongoose';

import type { Post } from './post.interfaces';

// documento de mongoose para una publicacion.
export type PostDocument = HydratedDocument<Post>;
