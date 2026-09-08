const MAX_EDGE = 960;
const MAX_CHARS = 280_000;

export async function compressImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose a photograph.");
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photograph.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const quality of [0.82, 0.7, 0.55]) {
    const data = canvas.toDataURL("image/jpeg", quality);
    if (data.length <= MAX_CHARS) return data;
  }
  throw new Error("That photograph is too large. Try a smaller one.");
}
