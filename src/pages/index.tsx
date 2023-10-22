import { useUser } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";
import { ChoreView } from "~/components/choreview";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { LoadingPage } from "~/components/loading";
import { useState } from "react";
import { ChoreWizard } from "~/components/chorewizard";

export default function Home() {
  const { isLoaded: userLoaded } = useUser();
  // Start fetching app asap
  api.chores.getChoresWithLatestComplete.useQuery();
  const [showChoreWizard, setShowChoreWizard] = useState(false);
  if (!userLoaded) return <div />;

  const toggleChoreWizard = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setShowChoreWizard((prev) => !prev);
  };
  return (
    <>
      <Head>
        <title>Tidyus</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="absolute flex h-full w-full flex-col items-center border-x md:max-w-7xl">
          <Header />
          <ChoresFeed />
          <button
            onClick={(e) => toggleChoreWizard(e)}
            className="absolute bottom-20 right-2 h-12 w-12 rounded-full bg-emerald-400 pb-0.5 text-2xl shadow-lg"
          >
            +
          </button>
          {showChoreWizard && <ChoreWizard />}
          <Footer />
        </div>
      </main>
    </>
  );
}

const ChoresFeed = () => {
  const { data, isLoading: choresLoading } =
    api.chores.getChoresWithLatestComplete.useQuery();
  if (choresLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div className="grid w-full grid-flow-row grid-cols-1 justify-items-center gap-4 overflow-auto p-2 md:grid-cols-3 lg:grid-cols-4">
      {data.map((chore) => (
        <ChoreView key={chore.id} {...chore} />
      ))}
    </div>
  );
};
