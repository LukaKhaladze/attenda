-- AlterTable
ALTER TABLE "MeetingOffer" ADD COLUMN IF NOT EXISTS "senderAttendeeId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MeetingOffer_senderAttendeeId_createdAt_idx"
  ON "MeetingOffer"("senderAttendeeId", "createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'MeetingOffer_senderAttendeeId_fkey'
  ) THEN
    ALTER TABLE "MeetingOffer"
      ADD CONSTRAINT "MeetingOffer_senderAttendeeId_fkey"
      FOREIGN KEY ("senderAttendeeId") REFERENCES "Attendee"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
