CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HOST');

ALTER TABLE "Conference"
ADD COLUMN "customSubdomain" TEXT;

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'HOST';

CREATE TABLE "HostConference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "conferenceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HostConference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Conference_customSubdomain_key" ON "Conference"("customSubdomain");
CREATE UNIQUE INDEX "HostConference_userId_conferenceId_key" ON "HostConference"("userId", "conferenceId");
CREATE INDEX "HostConference_conferenceId_idx" ON "HostConference"("conferenceId");

ALTER TABLE "HostConference"
ADD CONSTRAINT "HostConference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "HostConference"
ADD CONSTRAINT "HostConference_conferenceId_fkey"
FOREIGN KEY ("conferenceId") REFERENCES "Conference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
