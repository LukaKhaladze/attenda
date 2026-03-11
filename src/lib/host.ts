import { getServerSession } from "next-auth";
import { hasAdminAccess, hasHostAccess } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function getHostScopedConference(conferenceId: string, userId: string, allowAdmin = false) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    return null;
  }

  if (allowAdmin && hasAdminAccess(user)) {
    return prisma.conference.findUnique({
      where: { id: conferenceId },
      include: {
        hostAssignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true }
            }
          }
        }
      }
    });
  }

  if (!hasHostAccess(user)) {
    return null;
  }

  const assignment = await prisma.hostConference.findFirst({
    where: { conferenceId, userId },
    include: {
      conference: {
        include: {
          hostAssignments: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true }
              }
            }
          }
        }
      }
    }
  });

  return assignment?.conference ?? null;
}

export async function canUserManageConference(conferenceId: string, userId: string, allowAdmin = false) {
  const conference = await getHostScopedConference(conferenceId, userId, allowAdmin);
  return Boolean(conference);
}
