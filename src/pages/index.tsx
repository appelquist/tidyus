import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { ChoreComplete, type Chore } from "@prisma/client";
import Head from "next/head";

import { RouterOutputs, api } from "~/utils/api";

export default function Home() {
  const user = useUser();
  const { data, isLoading } = api.chores.getChoresWithLatestComplete.useQuery();
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Something went wrong</div>;
  return (
    <>
      <Head>
        <title>Tidyus</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x md:max-w-7xl">
          <div className="flex justify-end border-b border-slate-500 p-2">
            {!user.isSignedIn && <SignInButton />}
            {!!user.isSignedIn && <SignOutButton />}
          </div>
          <CreateChoreWizard />
          <div className="grid grid-flow-row grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-4">
            {data.map((chore) => (
              <ChoreCard key={chore.chore.id} {...chore} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

type ChoreWithUser =
  RouterOutputs["chores"]["getChoresWithLatestComplete"][number];

const ChoreCard = (props: ChoreWithUser) => {
  const { title, interval, isCompletedWithinInterval, choreCompletes } =
    props.chore;
  return (
    <div
      className={`rounded-md border ${
        isCompletedWithinInterval ? "bg-lime-400" : "bg-red-400"
      } p-2`}
    >
      <h1 className="">{title}</h1>
      <h3>Should be done every: {interval} days</h3>
      <CompleteStatusesView
        statuses={completeStatuses(interval, choreCompletes)}
      />
    </div>
  );
};

const CreateChoreWizard = () => {
  const { user } = useUser();
  if (!user) return null;
  return (
    <div className="flex w-full gap-3 border p-2">
      <img
        src={user.imageUrl}
        alt="Profile image"
        className="h-12 w-12 rounded-full"
      />
      <input placeholder="Title!" className="bg-transparent outline-none" />
      <input placeholder="Interval" className="bg-transparent outline-none" />
    </div>
  );
};

const CompleteStatusesView = ({ statuses }: { statuses: CompleteStatus[] }) => {
  const completeStatuses = statuses.map((status, i) => {
    return (
      <div
        key={i}
        className={`h-6 w-6 rounded-full ${
          status === CompleteStatus.CompletedInTime
            ? "bg-lime-200"
            : "bg-red-200"
        }`}
      ></div>
    );
  });
  return <div className="flex w-2/3 justify-evenly">{completeStatuses}</div>;
};

const completeStatuses = (
  interval: number,
  choreCompletes: ChoreComplete[],
) => {
  return choreCompletes
    .map((choreComplete, i, completes) => {
      console.log(choreCompletes);
      const previousComplete = completes[i + 1];
      if (!previousComplete) {
        const intervalStart = Date.now() - interval * 86400000;
        if (choreComplete.completedAt.getTime() > intervalStart) {
          return CompleteStatus.CompletedInTime;
        }
        return CompleteStatus.NotCompletedInTime;
      }
      const intervalStart =
        previousComplete.completedAt.getTime() - interval * 86400000;
      if (choreComplete.completedAt.getTime() > intervalStart) {
        return CompleteStatus.CompletedInTime;
      }
      return CompleteStatus.NotCompletedInTime;
    })
    .reverse();
};

enum CompleteStatus {
  CompletedInTime = "completedInTime",
  NotCompletedInTime = "notCompletedInTime",
}
