"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AddTaskButton } from "./AddTaskButton";
import { TodoItem } from "./TodoItem";
import type { Todo } from "@/types/todo";

const STORAGE_KEY = "todo-list-items";

const INITIAL_TODOS: Todo[] = [
  { id: "1", text: "Watch tutorials", completed: true },
  { id: "2", text: "Work on website", completed: false },
];

function createId() {
  return crypto.randomUUID();
}

function focusTodoInput(id: string, cursorPosition = 0) {
  const input = document.querySelector<HTMLInputElement>(
    `[data-todo-input="${id}"]`,
  );
  if (!input) return;
  input.focus();
  const position = Math.min(cursorPosition, input.value.length);
  input.setSelectionRange(position, position);
}

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return INITIAL_TODOS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Todo[];
      const saved = parsed.filter((t) => t.text.trim() !== "");
      if (saved.length > 0) return saved;
    }
  } catch {
    /* use defaults */
  }
  return INITIAL_TODOS;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [focusNewId, setFocusNewId] = useState<string | null>(null);
  const focusCursorRef = useRef(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTodos((prev) => {
      const loaded = loadTodos();
      const hasUnsavedDraft = prev.some(
        (t) =>
          t.text.trim() === "" && !loaded.some((loadedTodo) => loadedTodo.id === t.id),
      );
      if (hasUnsavedDraft) return prev;
      return loaded;
    });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const saved = todos.filter((t) => t.text.trim() !== "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [todos, hydrated]);

  const insertNewTask = useCallback(() => {
    let focusId = "";

    setTodos((prev) => {
      const existingDraft = prev.find((t) => t.text.trim() === "");
      if (existingDraft) {
        focusId = existingDraft.id;
        return prev;
      }

      focusId = createId();
      return [
        ...prev,
        { id: focusId, text: "", completed: false },
      ];
    });

    if (focusId) {
      focusCursorRef.current = 0;
      setFocusNewId(focusId);
    }
  }, []);

  const addTaskAfter = useCallback((afterId: string, cursorPosition: number) => {
    let focusId = "";
    let focusCursor = 0;

    flushSync(() => {
      setTodos((prev) => {
        const index = prev.findIndex((t) => t.id === afterId);
        if (index === -1) return prev;

        const current = prev[index];
        const textBefore = current.text.slice(0, cursorPosition);
        const textAfter = current.text.slice(cursorPosition);

        if (!current.text.trim() && !textAfter) return prev;

        const below = prev[index + 1];
        const next = [...prev];
        next[index] = { ...current, text: textBefore };

        if (below?.text.trim() === "") {
          focusId = below.id;
          next[index + 1] = { ...below, text: textAfter };
          focusCursor = textAfter.length;
          return next;
        }

        focusId = createId();
        focusCursor = textAfter.length;
        next.splice(index + 1, 0, {
          id: focusId,
          text: textAfter,
          completed: false,
        });
        return next;
      });
    });

    if (!focusId) return;

    focusCursorRef.current = focusCursor;
    setFocusNewId(focusId);
  }, []);

  const addTask = useCallback(() => insertNewTask(), [insertNewTask]);

  useLayoutEffect(() => {
    if (!focusNewId) return;
    focusTodoInput(focusNewId, focusCursorRef.current);
    setFocusNewId(null);
  }, [focusNewId]);

  const toggleTask = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }, []);

  const commitTask = useCallback((id: string) => {
    setTodos((prev) => {
      const todo = prev.find((t) => t.id === id);
      if (!todo || todo.text.trim() !== "") return prev;
      return prev.filter((t) => t.id !== id);
    });
    setFocusNewId(null);
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setFocusNewId(null);
  }, []);

  return (
    <main className="relative flex h-dvh w-full flex-col items-center overflow-hidden bg-white tablet:h-auto tablet:min-h-dvh tablet:overflow-visible">
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col items-stretch gap-1 overflow-y-auto overscroll-y-contain px-4 pb-24 pt-20 tablet:w-[440px] tablet:max-w-[440px] tablet:flex-none tablet:overflow-visible tablet:px-6 tablet:pb-28 tablet:pt-24 desktop:w-[500px] desktop:max-w-[500px] desktop:px-0 desktop:pb-32 desktop:pt-[100px]">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTask}
            onTextChange={updateText}
            onCommit={commitTask}
            onDelete={deleteTask}
            onAddAfter={addTaskAfter}
            autoFocus={todo.id === focusNewId}
          />
        ))}
      </div>

      <AddTaskButton onClick={addTask} />
    </main>
  );
}
