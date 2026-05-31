import { PlusIcon } from "./PlusIcon";

type AddTaskButtonProps = {
  onClick: () => void;
};

export function AddTaskButton({ onClick }: AddTaskButtonProps) {
  return (
    <button
      type="button"
      data-add-task
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label="Add task"
      className="group fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full border border-solid border-border bg-white p-3 shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:border-muted hover:bg-neutral-50 hover:shadow-md active:scale-95 active:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black tablet:bottom-8 tablet:p-3.5 desktop:bottom-10 desktop:p-4"
    >
      <PlusIcon />
    </button>
  );
}
