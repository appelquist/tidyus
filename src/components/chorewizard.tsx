import { useRef, useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import toast from "react-hot-toast";

type Props = {
  setShowChoreWizard: (show: boolean) => void;
};

export const ChoreWizard = ({ setShowChoreWizard }: Props) => {
  const titleRef = useRef(null);
  const [interval, setInterval] = useState(0);
  const ctx = api.useContext();
  const { mutate, isLoading } = api.chores.createChore.useMutation({
    onSuccess: () => {
      setInterval(0);
      void ctx.chores.getChoresWithLatestComplete.invalidate();
      setShowChoreWizard(false);
    },
    onError: (e) => {
      const intervalErrorMessage = e.data?.zodError?.fieldErrors.interval;
      const titleErrorMessage = e.data?.zodError?.fieldErrors.title;
      if (intervalErrorMessage?.[0]) {
        toast.error(intervalErrorMessage[0]);
      }
      if (titleErrorMessage?.[0]) {
        toast.error(titleErrorMessage[0]);
      } else {
        toast.error("Failed to create chore!");
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "interval") {
      const input = parseInt(e.target.value);
      if (isNaN(input)) {
        setInterval(0);
      } else {
        setInterval(input);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!titleRef?.current) {
      return;
    }
    //TODO: Research this linting error
    mutate({ title: titleRef.current.value, interval });
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className="absolute bottom-36 flex h-56 w-80 flex-col items-center justify-center rounded-2xl bg-emerald-300 p-2 shadow-xl"
    >
      <div className="flex flex-col items-start p-2">
        <label htmlFor="choreTitle" className="font-semibold">
          Chore title
        </label>
        <input
          id="choreTitle"
          className="w-full  rounded-lg p-1 outline-none"
          type="text"
          placeholder="Chore title..."
          ref={titleRef}
          disabled={isLoading}
          required
        />
      </div>
      <div className="flex flex-col items-start p-2">
        <label htmlFor="interval" className="font-semibold">
          Should be done every
        </label>
        <input
          id="interval"
          className="mb-1 w-full rounded-lg p-1 outline-none"
          type="text"
          value={interval}
          onChange={(e) => handleChange(e)}
          disabled={isLoading}
          required
        />
      </div>
      <button
        type="submit"
        className="flex h-12 w-24 items-center justify-center rounded-xl bg-emerald-200 pb-0.5 text-2xl shadow-md"
        disabled={isLoading}
      >
        {isLoading ? <LoadingSpinner size={6} /> : "+"}
      </button>
    </form>
  );
};
