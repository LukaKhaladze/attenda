import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "attendee-photos";

function getSafeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

async function uploadToSupabaseStorage(file: File) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const safeFileName = getSafeFileName(file.name);
  const objectPath = `profiles/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "ფაილი არ არის არჩეული" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "მხოლოდ სურათის ატვირთვაა შესაძლებელი" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "ფაილი ძალიან დიდია. მაქსიმუმ 2MB" }, { status: 413 });
    }

    const supabaseUrl = await uploadToSupabaseStorage(file);
    if (supabaseUrl) {
      return NextResponse.json({ url: supabaseUrl, storage: "supabase" });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "ფოტოს ასატვირთად Supabase Storage ან Vercel Blob არ არის დაყენებული" }, { status: 500 });
    }

    const safeFileName = getSafeFileName(file.name);
    const blob = await put(`profiles/${Date.now()}-${safeFileName}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "ატვირთვა ვერ მოხერხდა" }, { status: 500 });
  }
}
