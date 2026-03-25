"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  X,
  ClipboardList,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import {
  getJointOperation,
  getTasksForOperation,
} from "@/lib/data/platform-api";
import type { JointOperation, SharedTask, TaskStatus } from "@/lib/types/platform";

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "var(--color-muted)" },
  { key: "in_progress", label: "In Progress", color: "var(--color-accent)" },
  { key: "completed", label: "Done", color: "var(--color-success)" },
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function TaskCard({ task }: { task: SharedTask }) {
  const isBlocked = task.status === "blocked";
  const isDone = task.status === "completed";

  return (
    <div
      className={`rounded-xl border-2 bg-white p-3 ${
        isBlocked
          ? "border-danger"
          : "border-slate-200"
      } ${isDone ? "opacity-70" : ""}`}
    >
      {/* Blocked badge */}
      {isBlocked && (
        <div className="flex items-center gap-1 text-xs font-medium text-danger mb-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          Blocked
        </div>
      )}

      {/* Title */}
      <p
        className={`text-sm font-medium mb-2 ${
          isDone
            ? "line-through text-slate-400"
            : "text-primary"
        }`}
      >
        {task.title}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {task.claimedByName && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {task.claimedByName}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TaskBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const [operation, setOperation] = useState<JointOperation | null>(null);
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    async function load() {
      const [op, taskData] = await Promise.all([
        getJointOperation(id),
        getTasksForOperation(id),
      ]);
      setOperation(op);
      setTasks(taskData);
      setLoading(false);
    }
    load();
  }, [id]);

  function handleAddTask() {
    if (!newTaskTitle.trim()) return;
    const newTask: SharedTask = {
      id: `st_new_${Date.now()}`,
      jointOpId: id,
      title: newTaskTitle.trim(),
      status: "todo",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setShowAddModal(false);
  }

  function getTasksByStatus(status: TaskStatus): SharedTask[] {
    return tasks.filter((t) => t.status === status);
  }

  // Blocked tasks go into the "todo" column visually but with a red border
  const blockedTasks = tasks.filter((t) => t.status === "blocked");

  if (loading) {
    return (
      <div className="max-w-lg mx-auto md:max-w-4xl">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-4" />
          <div className="h-4 bg-slate-100 rounded w-3/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-24 bg-slate-100 rounded-xl" />
                <div className="h-24 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="max-w-lg mx-auto md:max-w-4xl">
        <div className="text-center py-16">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm mb-4">Operation not found</p>
          <Link
            href={`/${locale}/collaborate`}
            className="text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            Back to Collaborations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-4xl">
      {/* Back link */}
      <Link
        href={`/${locale}/collaborate`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Collaborations
      </Link>

      {/* Operation header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-lg font-bold text-primary">
            {operation.title}
          </h1>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
              operation.status === "active"
                ? "bg-green-100 text-green-700"
                : operation.status === "completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {operation.status === "active"
              ? "Active"
              : operation.status === "completed"
              ? "Completed"
              : "Cancelled"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{operation.actorNames.join(" & ")}</span>
        </div>

        <p className="text-xs text-slate-400">
          Collaboration ID: {operation.collaborationId} · Created{" "}
          {formatDate(operation.createdAt)}
        </p>
      </div>

      {/* Add Task button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Task Board
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const columnTasks = getTasksByStatus(col.key);
          // Add blocked tasks to the "To Do" column
          const displayTasks =
            col.key === "todo"
              ? [...columnTasks, ...blockedTasks]
              : columnTasks;

          return (
            <div key={col.key}>
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: col.color }}
                />
                <h3 className="text-sm font-semibold text-slate-700">
                  {col.label}
                </h3>
                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {displayTasks.length}
                </span>
              </div>

              {/* Task cards */}
              <div className="space-y-2 min-h-[100px] bg-slate-50 rounded-xl p-2">
                {displayTasks.length > 0 ? (
                  displayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-20 text-xs text-slate-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add task modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-primary">
                Add New Task
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) =>
                setNewTaskTitle(e.target.value.slice(0, 100))
              }
              placeholder="What needs to be done?"
              className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {newTaskTitle.length}/100
            </p>

            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="w-full mt-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
