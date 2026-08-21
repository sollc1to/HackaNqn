# Nexo Solidario — Guía de inicio (Mobile)

App móvil desarrollada con **Expo / React Native**, con un backend en **Node.js + Express + MongoDB**. Esta guía explica cómo levantar el proyecto en **Linux** y **Windows** para correr la versión mobile.

## Estructura del proyecto

```
HackaNqn-master/
├── server/    # Backend (Express + MongoDB)
└── mobile/    # App móvil (Expo)
```

Para usar la app necesitás tener **el servidor corriendo** y **luego** levantar la app mobile, ya que la app se conecta al backend para autenticación, publicaciones y chat.

## Requisitos previos

- **Node.js** 18 o superior ([nodejs.org](https://nodejs.org))
- **pnpm** (para el servidor) → `npm install -g pnpm`
- **npm** (para mobile, ya viene con Node.js)
- **Expo Go** instalada en tu celular (Android/iOS), para probar la app sin compilarla nativamente
- Una base de datos **MongoDB** (local o en la nube, por ejemplo [MongoDB Atlas](https://www.mongodb.com/atlas))
- Git (opcional, si vas a clonar el repo en vez de descargar el zip)

---

## 1. Backend (server)

### Linux

```bash
cd server
pnpm install
```

Creá un archivo `.env` dentro de `server/` con la conexión a Mongo:

```bash
echo "MONGO_URI=mongodb://localhost:27017/nexo-solidario" > .env
```

(reemplazá la URI por la de tu instancia de MongoDB, local o Atlas)

Iniciá el servidor en modo desarrollo:

```bash
pnpm dev
```

Vas a ver en consola `mongo connected` y `server running on port 3000`.

### Windows

Abrí **PowerShell** o **CMD**:

```powershell
cd server
pnpm install
```

Creá el archivo `.env` dentro de `server/` (con el Bloc de notas o VS Code) y agregá:

```
MONGO_URI=mongodb://localhost:27017/nexo-solidario
```

Iniciá el servidor:

```powershell
pnpm dev
```

> Si no tenés `pnpm` instalado, ejecutá primero `npm install -g pnpm`.

---

## 2. App Mobile (Expo)

### Linux

```bash
cd mobile
npm install
```

Si vas a correr la app en un **dispositivo físico** (no emulador), necesitás indicarle la IP de tu PC en la red local, ya que `localhost` no funciona desde el celular. Creá un archivo `.env` en `mobile/`:

```bash
echo "EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000" > .env
```

Para saber tu IP local en Linux:

```bash
hostname -I
```

Iniciá la app:

```bash
npx expo start
```

Se va a abrir un código QR en la terminal: escaneálo con la app **Expo Go** desde tu celular (Android: cámara o app Expo Go; iOS: cámara nativa).

### Windows

Abrí **PowerShell** o **CMD**:

```powershell
cd mobile
npm install
```

Para saber tu IP local en Windows:

```powershell
ipconfig
```

Buscá la línea **IPv4 Address** de tu adaptador de red (Wi-Fi o Ethernet). Creá un archivo `.env` en `mobile/` con:

```
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000
```

Iniciá la app:

```powershell
npx expo start
```

Escaneá el código QR con **Expo Go** desde tu celular.

---

## Notas importantes

- **Celular y PC deben estar en la misma red Wi-Fi** para que el celular pueda alcanzar al servidor por IP local.
- Si usás el **emulador de Android** en tu PC en vez de un celular físico, no hace falta configurar `EXPO_PUBLIC_API_URL`: la app ya usa `http://10.0.2.2:3000` automáticamente para conectarse al servidor corriendo en tu máquina.
- Si usás la versión **web** de Expo (`npx expo start --web`), tampoco hace falta configurarlo: usa `http://localhost:3000` por defecto.
- Revisá que el firewall de Windows no esté bloqueando el puerto 3000 si el celular no logra conectarse.
- El backend necesita una base de datos MongoDB accesible (local con `mongod` corriendo, o una cadena de conexión de MongoDB Atlas).

## Orden recomendado para levantar todo

1. Levantar MongoDB (local o Atlas ya disponible)
2. `pnpm dev` en `server/`
3. Configurar `EXPO_PUBLIC_API_URL` en `mobile/.env` (si usás celular físico)
4. `npx expo start` en `mobile/`
5. Escanear el QR con Expo Go
