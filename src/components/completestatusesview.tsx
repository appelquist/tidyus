import { RouterOutputs } from "~/utils/api";

type CompleteStatus =
  RouterOutputs["chores"]["getChoresWithLatestComplete"][number]["choreCompletes"][number];

type Props = {
  statuses: CompleteStatus[];
};

export const CompleteStatusesView = ({ statuses }: Props) => {
  const completeStatuses = statuses.map((status, i) => {
    return (
      <div
        key={i}
        className={`mr-2 h-6 w-6 rounded-full border ${
          status === "completedInTime"
            ? "border-lime-400 bg-lime-200"
            : "border-red-300 bg-red-200"
        }`}
      ></div>
    );
  });
  return (
    <div className="flex w-2/3 min-w-max justify-start">{completeStatuses}</div>
  );
};
