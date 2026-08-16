export async function pickImage(fallbackUri: string): Promise<string | undefined> {
  if (typeof document === 'undefined') return fallbackUri;

  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      resolve(file ? URL.createObjectURL(file) : undefined);
    };
    input.click();
  });
}
