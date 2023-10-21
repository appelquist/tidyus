import { RouterOutputs } from "~/utils/api";
import { CompleteStatusesView } from "./completestatusesview";
import { useState } from "react";
import { ChoreEditView } from "./choreeditview";

type ChoreWithUser =
  RouterOutputs["chores"]["getChoresWithLatestComplete"][number];

export const ChoreView = (props: ChoreWithUser) => {
  const { title, interval, choreCompletes, isOverdue } = props;
  const [showController, setShowController] = useState(false);
  const toggleController = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    setShowController(!showController);
  };
  if (showController) {
    return <ChoreEditView chore={props} toggleController={toggleController} />;
  }
  return (
    <div
      className={`flex h-36 w-72 cursor-pointer flex-col justify-between rounded-md border p-2 shadow-md hover:shadow-lg ${
        isOverdue ? "border-red-300 bg-red-50" : "border-lime-400 bg-lime-50"
      }`}
      onClick={(e) => toggleController(e)}
    >
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <h3>
          Should be done every:{" "}
          <span className="font-semibold">{interval} days</span>
        </h3>
      </div>
      <CompleteStatusesView statuses={choreCompletes} />
    </div>
  );
};