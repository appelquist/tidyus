import { RouterOutputs, api } from "~/utils/api";
import Image from "next/image";
import checkSvg from "../../public/check.svg";
import pencilSvg from "../../public/pencil.svg";
import deleteSvg from "../../public/trash.svg";
import { LoadingSpinner } from "./loading";
import toast from "react-hot-toast";

type ChoreWithUser =
  RouterOutputs["chores"]["getChoresWithLatestComplete"][number];

type Props = {
  chore: ChoreWithUser;
  toggleController: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  setShowController: (show: boolean) => void;
};
export const ChoreEditView = ({
  chore,
  toggleController,
  setShowController,
}: Props) => {
  const ctx = api.useContext();
  const { isOverdue, title, id } = chore;
  const { mutate: completeChore, isLoading: isLoadingComplete } =
    api.chores.createChoreComplete.useMutation({
      onSuccess: () => {
        void ctx.chores.getChoresWithLatestComplete.invalidate();
        setShowController(false);
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to complete chore!");
        }
      },
    });
  const { mutate: deleteChore, isLoading: isLoadingDelete } =
    api.chores.deleteChore.useMutation({
      onSuccess: () => {
        void ctx.chores.getChoresWithLatestComplete.invalidate();
        setShowController(false);
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage?.[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to delete chore!");
        }
      },
    });
  const handleChoreComplete = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    completeChore({ choreId: id });
  };
  const handleChoreDelete = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    deleteChore({ choreId: id });
  };
  return (
    <div
      onClick={(e) => toggleController(e)}
      className={`flex h-36 w-72 cursor-pointer flex-col rounded-2xl border p-2 shadow-md hover:shadow-lg ${
        isOverdue ? "border-red-300 bg-red-50" : "border-lime-400 bg-lime-50"
      }`}
    >
      <h1 className="w-full text-lg font-semibold">{title}</h1>
      <div className="flex h-full w-full items-center justify-center">
        <div
          onClick={(e) => handleChoreComplete(e)}
          className="flex w-36 items-center justify-center"
        >
          {isLoadingComplete ? (
            <LoadingSpinner size={8} />
          ) : (
            <Image
              className="h-12 w-12"
              src={checkSvg as string}
              alt="Complete chore logo"
            />
          )}
        </div>
        <div className="flex w-36 items-center justify-center">
          <Image
            className="h-12 w-12"
            src={pencilSvg as string}
            alt="Edit chore logo"
          />
        </div>
        <div
          className="flex w-36 items-center justify-center"
          onClick={(e) => handleChoreDelete(e)}
        >
          {isLoadingDelete ? (
            <LoadingSpinner size={8} />
          ) : (
            <Image
              className="h-12 w-12"
              src={deleteSvg as string}
              alt="Delete chore logo"
            />
          )}
        </div>
      </div>
    </div>
  );
};
