CREATE TABLE "MeetingOfferMessage" (
  "id" TEXT NOT NULL,
  "meetingOfferId" TEXT NOT NULL,
  "authorAttendeeId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeetingOfferMessage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MeetingOfferMessage"
  ADD CONSTRAINT "MeetingOfferMessage_meetingOfferId_fkey"
  FOREIGN KEY ("meetingOfferId") REFERENCES "MeetingOffer"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MeetingOfferMessage"
  ADD CONSTRAINT "MeetingOfferMessage_authorAttendeeId_fkey"
  FOREIGN KEY ("authorAttendeeId") REFERENCES "Attendee"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "MeetingOfferMessage_meetingOfferId_createdAt_idx"
  ON "MeetingOfferMessage"("meetingOfferId", "createdAt");

CREATE INDEX "MeetingOfferMessage_authorAttendeeId_createdAt_idx"
  ON "MeetingOfferMessage"("authorAttendeeId", "createdAt");
