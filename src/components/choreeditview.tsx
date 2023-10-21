import { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import checkSvg from "../../public/check.svg";
import pencilSvg from "../../public/pencil.svg";

type ChoreWithUser =
  RouterOutputs["chores"]["getChoresWithLatestComplete"][number];

type Props = {
  chore: ChoreWithUser;
  toggleController: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};
export const ChoreEditView = ({ chore, toggleController }: Props) => {
  const { isOverdue, title, id } = chore;
  const handleChoreComplete = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
  };
  return (
    <div
      onClick={(e) => toggleController(e)}
      className={`flex h-36 w-72 cursor-pointer flex-col rounded-md border p-2 shadow-md hover:shadow-lg ${
        isOverdue ? "border-red-300 bg-red-50" : "border-lime-400 bg-lime-50"
      }`}
    >
      <h1 className="w-full text-lg font-semibold">{title}</h1>
      <div className="flex h-full w-full items-center justify-center">
        <div
          onClick={(e) => handleChoreComplete(e)}
          className="flex w-36 items-center justify-center"
        >
          <Image
            className="h-12 w-12"
            src={checkSvg as string}
            alt="Complete chore logo"
          />
        </div>
        <div className="flex w-36 items-center justify-center">
          <Image
            className="h-12 w-12"
            src={pencilSvg as string}
            alt="Edit chore logo"
          />
        </div>
      </div>
    </div>
  );
};
