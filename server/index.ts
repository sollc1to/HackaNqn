import express from "express";
import cors from 'cors';
import { AuthRouter } from './modules/user/user.routes';
import { PostRouter } from './modules/post/post.routes';
import { ChatRouter } from './modules/chat/chat.routes';
import mongoose from 'mongoose';
import 'dotenv/config';

// toma la uri guardada en el env.
const uri = `${process.env.MONGO_URI}`;

// inicia express.
const app = express();

// habilita solicitudes a todos los origenes.
app.use(cors());

// inicia la conexion con mongo.
await mongoose.connect(uri).then(() => console.log('mongo connected'));

// permite leer body json en las solicitudes.
app.use(express.json());

// monta las rutas de autenticacion.
app.use('/api/auth', AuthRouter);
// monta las rutas de publicaciones.
app.use('/api/posts', PostRouter);
// monta las rutas del chat de publicaciones.
app.use('/api/chats', ChatRouter);

// levanta el servidor en el puerto configurado.
app.listen(3000, () => {
  console.log('server running on port 3000');
});
