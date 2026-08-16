import type { HydratedDocument } from 'mongoose';

import type { ChatThread } from './chat.interfaces';

// documento de mongoose para un hilo de chat.
export type ChatThreadDocument = HydratedDocument<ChatThread>;
