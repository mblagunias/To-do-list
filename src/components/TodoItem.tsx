import { Checkbox } from "./Checkbox";
import { TrashIcon } from "./TrashIcon";
import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onCommit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string, cursorPosition: number) => void;
  autoFocus?: boolean;
};

export function TodoItem({
  todo,
  onToggle,
  onTextChange,
  onCommit,
  onDelete,
  onAddAfter,
  autoFocus,
}: TodoItemProps) {
  const isEmpty = todo.text.trim() === "";

  return (
    <div
      className={`flex w-full shrink-0 items-center py-2 px-3 tablet:py-2.5 tablet:px-3.5 ${
        todo.completed
          ? "group justify-between transition-colors hover:bg-neutral-50"
          : "gap-3"
      }`}
    >
      <div
        className={`flex min-w-0 items-center gap-3 ${
          todo.completed ? "flex-1" : "w-full"
        }`}
      >
        <Checkbox
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          label={
            isEmpty ? "Mark task complete" : `Mark "${todo.text}" complete`
          }
        />
        <input
          type="text"
          data-todo-input={todo.id}
          value={todo.text}
          onChange={(e) => onTextChange(todo.id, e.target.value)}
          onBlur={(e) => {
            const related = e.relatedTarget as HTMLElement | null;
            if (
              related?.closest("[data-add-task]") ||
              related?.closest("[data-delete-task]") ||
              related?.closest("[data-todo-input]")
            ) {
              return;
            }
            onCommit(todo.id);
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
            e.preventDefault();
            const input = e.currentTarget;
            const cursor = input.selectionStart ?? todo.text.length;
            if (todo.text.trim() !== "" || cursor < todo.text.length) {
              onAddAfter(todo.id, cursor);
            } else {
              input.blur();
            }
          }}
          autoFocus={autoFocus}
          placeholder="Enter task"
          className={`min-w-0 flex-1 bg-transparent text-sm leading-normal outline-none tablet:text-base ${
            todo.completed
              ? "text-black line-through decoration-solid"
              : isEmpty
                ? "text-muted placeholder:text-muted"
                : "text-black"
          }`}
        />
      </div>
      {todo.completed && (
        <button
          type="button"
          data-delete-task
          onClick={() => onDelete(todo.id)}
          aria-label={isEmpty ? "Delete task" : `Delete "${todo.text}"`}
          className="pointer-events-none shrink-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}
