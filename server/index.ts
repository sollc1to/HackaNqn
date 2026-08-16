import express from "express";
import cors from 'cors';
import { AuthRouter } from './modules/user/user.routes';
import { PostRouter } from './modules/post/post.routes';
import mongoose from 'mongoose';
import 'dotenv/config';

// toma la uri guardada en el env.
const uri = `${process.env.MONGO_URI}`;

// inicia express.
const app = express();

app.use(cors()); // habilita solicitudes a todos los origenes.


// inicia la conexion con mongo.
await mongoose.connect(uri).then(() => console.log('mongo connected'));

app.use(express.json()); // parsea los json de las solicitudes.

app.use('/api/auth', AuthRouter); // rutas de autenticacion.
app.use('/api/posts', PostRouter); // rutas de publicaciones.



app.listen(3000, () => {
  console.log('server running on port 3000');
});
