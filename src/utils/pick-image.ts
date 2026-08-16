// Fallback móvil del MVP. La versión web del mismo módulo abre el selector real
// del navegador sin sumar una dependencia nativa al proyecto.
export async function pickImage(fallbackUri: string) {
  return fallbackUri;
}
