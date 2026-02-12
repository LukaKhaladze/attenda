import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (session) {
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id
      }
    });
  }

  return NextResponse.redirect(new URL("/auth/signin", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
