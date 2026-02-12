-- CreateEnum
CREATE TYPE "MeetingOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "MeetingOffer" (
    "id" TEXT NOT NULL,
    "recipientAttendeeId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderContact" TEXT,
    "proposedAt" TIMESTAMP(3),
    "note" TEXT,
    "status" "MeetingOfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingOffer_recipientAttendeeId_createdAt_idx" ON "MeetingOffer"("recipientAttendeeId", "createdAt");

-- AddForeignKey
ALTER TABLE "MeetingOffer" ADD CONSTRAINT "MeetingOffer_recipientAttendeeId_fkey" FOREIGN KEY ("recipientAttendeeId") REFERENCES "Attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
