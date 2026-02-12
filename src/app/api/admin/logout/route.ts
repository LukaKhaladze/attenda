import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.redirect(new URL("/auth/signin", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
