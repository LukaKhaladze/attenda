import { put } from "@vercel/blob";

const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "attendee-photos";

function getSafeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadToSupabaseStorage(file: File, folder: string) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const safeFileName = getSafeFileName(file.name);
  const objectPath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": file.type,
      "x-upsert": "false"
    },
    body: file
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SUPABASE_STORAGE_UPLOAD_FAILED:${body}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${objectPath}`;
}

export async function uploadImageFile(file: File, folder: string) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("მხოლოდ სურათის ატვირთვაა შესაძლებელი");
  }

  const supabaseUrl = await uploadToSupabaseStorage(file, folder);
  if (supabaseUrl) {
    return supabaseUrl;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("ფოტოს შესანახად დაამატე SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ან BLOB_READ_WRITE_TOKEN");
  }

  const blob = await put(`${folder}/${Date.now()}-${getSafeFileName(file.name)}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN
  });

  return blob.url;
}
