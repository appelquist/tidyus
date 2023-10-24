import { User } from "@clerk/backend/dist/types/api";
import { clerkClient } from "@clerk/nextjs";
import { ChoreComplete } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import dayjs from "dayjs";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return {id: user.id, username: user.username, profileImageUrl: user.imageUrl}
}

const completeStatuses = (
    interval: number,
    choreCompletes: ChoreComplete[],
  ): CompleteStatus[] => {
    return choreCompletes
      .map((choreComplete, i, completes) => {
        const previousComplete = completes[i + 1];
        const choreCompletedAt = dayjs(choreComplete.completedAt);
        if (!previousComplete) {
          const intervalStart = dayjs().subtract(interval, "day");        
          if (choreCompletedAt.isAfter(intervalStart)) {
            return {
              completedAt: choreComplete.completedAt,
              completedInTime: true
            }
          }
          return {
            completedAt: choreComplete.completedAt,
            completedInTime: false
          }
        }
        const intervalStart = dayjs(previousComplete.completedAt).subtract(interval, "day");
        if (choreCompletedAt.isAfter(intervalStart)) {
          return {
            completedAt: choreComplete.completedAt,
            completedInTime: true
          }
        }
        return {
          completedAt: choreComplete.completedAt,
          completedInTime: false
        }
      })
      .reverse();
  };
  
type CompleteStatus = {
  completedAt: Date;
  completedInTime: boolean
}

export const choresRouter = createTRPCRouter({
  getChoresWithLatestComplete: privateProcedure.query(async ({ctx}) => {
    const choresWithLatestComplete = await ctx.prisma.chore.findMany({where:{
      createdBy: ctx.userId
    },include: {
        choreCompletes: true,
    },});
    const users = (await clerkClient.users.getUserList({
        userId: choresWithLatestComplete.map((chore) => chore.createdBy),
        limit: 100,
    })).map(filterUserForClient);

    const choresForUser = choresWithLatestComplete.map((chore) => {
        const user = users.find((user) => user.id === chore.createdBy)
        if (!user) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "User for chore not found"});
        return {
            chore,
            createdBy: user
        }
    })

   const choresWithSortedChoreCompletes = choresForUser.map((chore) => {
    chore.chore.choreCompletes.sort((a,b) => {
        return b.completedAt.getTime() - a.completedAt.getTime();
    })
    return chore;
   });

   return choresWithSortedChoreCompletes.map(chore => {
        const choreCompletes = completeStatuses(chore.chore.interval, chore.chore.choreCompletes);
        // const isOverdue = choreCompletes[choreCompletes.length - 1] === "notCompletedInTime" ? true : false
        const latestComplete = choreCompletes[choreCompletes.length - 1];
        if (!latestComplete) {
          const isOverdue = dayjs().isAfter(dayjs(chore.chore.createdAt).add(chore.chore.interval, "day"));
          return {...chore.chore, choreCompletes: choreCompletes, isOverdue: isOverdue}
        }
        const isOverdue = dayjs().isAfter(dayjs(latestComplete.completedAt).add(chore.chore.interval, "day"));
        return {...chore.chore, choreCompletes: choreCompletes, isOverdue: isOverdue}
   });
  }),
  createChoreComplete: privateProcedure.input(z.object({
    choreId: z.string().min(1).max(255)
  })).mutation(async ({ctx, input}) => {
    const userId =  ctx.userId;
    const choreComplete = ctx.prisma.choreComplete.create({
      data: {
        completedBy: userId,
        choreId: input.choreId
      }
    })
    return choreComplete;
  }),
  createChore: privateProcedure.input(z.object({
    title: z.string().min(1).max(25),
    interval: z.number().min(1).max(1095),

  })).mutation(async ({ctx, input}) => {
    const userId =  ctx.userId;
    const chore = ctx.prisma.chore.create({
      data: {
        title: input.title,
        interval: input.interval,
        createdBy: userId
      }
    })
    return chore;
  })
});
