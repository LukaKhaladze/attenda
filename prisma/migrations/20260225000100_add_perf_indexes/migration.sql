-- Attendee list and filter speed
CREATE INDEX IF NOT EXISTS "Attendee_conferenceId_status_consentPublicList_createdAt_idx"
  ON "Attendee"("conferenceId", "status", "consentPublicList", "createdAt");

CREATE INDEX IF NOT EXISTS "Attendee_conferenceId_consentPublicList_position_idx"
  ON "Attendee"("conferenceId", "consentPublicList", "position");

-- Notification/sent-offer speed
CREATE INDEX IF NOT EXISTS "MeetingOffer_senderAttendeeId_status_createdAt_idx"
  ON "MeetingOffer"("senderAttendeeId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "MeetingOffer_senderContact_status_createdAt_idx"
  ON "MeetingOffer"("senderContact", "status", "createdAt");
