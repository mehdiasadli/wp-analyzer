export async function fromFileToString(file: File) {
  const text = await file.text();
  return text;
}
