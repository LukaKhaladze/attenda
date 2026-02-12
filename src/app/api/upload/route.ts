import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;

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

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl, storage: "inline" });
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await put(`profiles/${Date.now()}-${safeFileName}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "ატვირთვა ვერ მოხერხდა" }, { status: 500 });
  }
}
