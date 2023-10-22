import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

export const Header = () => {
  const user = useUser();
  return (
    <div className="flex h-16 w-full justify-between border-b border-slate-50 bg-emerald-400 p-2">
      <div className="flex items-center justify-center">
        <h1 className="text-3xl font-bold tracking-wide text-emerald-800">
          tidy<span className="font-normal">us</span>
        </h1>
      </div>
      <div className="flex items-center text-emerald-800">
        {!user.isSignedIn && <SignInButton />}
        {!!user.isSignedIn && <SignOutButton />}
      </div>
    </div>
  );
};
