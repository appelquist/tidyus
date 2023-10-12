import { User } from "@clerk/backend/dist/types/api";
import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {id: user.id, username: user.username, profileImageUrl: user.imageUrl}
}

export const choresRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const chores = await ctx.prisma.chore.findMany({
        take: 100,
    });
    
    const users = (await clerkClient.users.getUserList({
        userId: chores.map((chore) => chore.createdBy),
        limit: 100,
    })).map(filterUserForClient);

    return chores.map((chore) => {
        const user = users.find((user) => user.id === chore.createdBy)
        if (!user) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "User for chore not found"});
        return {
            chore,
            createdBy: user
        }
    })
  }),
  getChoresWithLatestComplete: publicProcedure.query(async ({ctx}) => {
    const choresWithLatestComplete = await ctx.prisma.chore.findMany({include: {
        choreCompletes: true,
    },});
    const users = (await clerkClient.users.getUserList({
        userId: choresWithLatestComplete.map((chore) => chore.createdBy),
        limit: 100,
    })).map(filterUserForClient);

   const choresWithSortedChoreCompletes = choresWithLatestComplete.map(chore => {
    chore.choreCompletes.sort((a,b) => {
        return b.completedAt.getTime() - a.completedAt.getTime();
    })
    return chore;
   })
    const choresWithStatus = choresWithSortedChoreCompletes.map(chore => {
        const latestChoreComplete = chore.choreCompletes[0]?.completedAt.getTime();
        if (!latestChoreComplete) {
            const deadline = chore.createdAt.getTime() + (chore.interval * 86400000);
            if (Date.now() > deadline) {
                return {
                    ...chore, isCompletedWithinInterval: false
                }
            }
            return {...chore, isCompletedWithinInterval: true}
        }
        const deadline = latestChoreComplete + (chore.interval * 86400000);
        if (Date.now() > deadline) {
            return {
                ...chore, isCompletedWithinInterval: false
            }
        }
        return {...chore, isCompletedWithinInterval: true}
    });
    return choresWithStatus.map((chore) => {
        const user = users.find((user) => user.id === chore.createdBy)
        if (!user) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "User for chore not found"});
        return {
            chore,
            createdBy: user
        }
    })
  })
});
