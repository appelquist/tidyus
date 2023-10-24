import { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import { CompleteStatusesView } from "./completestatusesview";
import { useState } from "react";
import { ChoreEditView } from "./choreeditview";
import alarmClock from "../../public/alarm-clock.svg";

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
      className={`flex h-36 w-72 cursor-pointer flex-col justify-start gap-5 rounded-2xl border p-2 shadow-md ${
        isOverdue ? "border-red-300 bg-red-50" : "border-lime-400 bg-lime-50"
      }`}
      onClick={(e) => toggleController(e)}
    >
      <h1 className="text-lg font-semibold">{title} </h1>
      <div className="flex w-36 items-center justify-start gap-1">
        <Image
          className="h-8 w-8"
          src={alarmClock as string}
          alt="Alarm clock"
        />
        <h3 className="font-semibold">Every {interval} days</h3>
      </div>

      <CompleteStatusesView statuses={choreCompletes} />
    </div>
  );
};
