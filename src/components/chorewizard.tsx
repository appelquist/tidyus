import { useState } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";

export const ChoreWizard = () => {
  const { mutate, isLoading } = api.chores.createChore.useMutation();
  const [title, setTitle] = useState("");
  const [interval, setInterval] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "choreTitle") setTitle(e.target.value);
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
    mutate({ title, interval });
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
          value={title}
          onChange={(e) => handleChange(e)}
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
        />
      </div>
      <button
        type="submit"
        className="flex h-12 w-24 items-center justify-center rounded-xl bg-emerald-200 pb-0.5 text-2xl shadow-md"
      >
        {isLoading ? <LoadingSpinner size={6} /> : "+"}
      </button>
    </form>
  );
};
