ALTER TABLE "Attendee" ADD COLUMN "email" TEXT;

CREATE INDEX "Attendee_conferenceId_email_idx" ON "Attendee"("conferenceId", "email");
