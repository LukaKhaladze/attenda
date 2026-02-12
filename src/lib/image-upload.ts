import { put } from "@vercel/blob";

export async function uploadImageFile(file: File, folder: string) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("მხოლოდ სურათის ატვირთვაა შესაძლებელი");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("ფაილი ძალიან დიდია. მაქსიმუმ 2MB");
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    return `data:${file.type};base64,${base64}`;
  }

  const blob = await put(`${folder}/${Date.now()}-${file.name}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return blob.url;
}
