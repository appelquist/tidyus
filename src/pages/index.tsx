import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { api } from "~/utils/api";
import { ChoreView } from "~/components/choreview";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { LoadingPage } from "~/components/loading";

export default function Home() {
  const { isLoaded: userLoaded } = useUser();
  // Start fetching app asap
  api.chores.getChoresWithLatestComplete.useQuery();
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Tidyus</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x md:max-w-7xl">
          <Header />
          <ChoresFeed />
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
    <div className="grid grid-flow-row grid-cols-1 justify-items-center gap-4 p-2 md:grid-cols-3 lg:grid-cols-4">
      {data.map((chore) => (
        <ChoreView key={chore.id} {...chore} />
      ))}
    </div>
  );
};
