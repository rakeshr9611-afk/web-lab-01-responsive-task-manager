/**
 * Pure task logic (no DOM). Works in the browser (window.Tasks)
 * and in Node (module.exports) so it can be unit-tested.
 */
(function (root) {
  const PRIORITIES = ["low", "medium", "high"];
  const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

  function createTask({ title, priority = "medium", due = "" }, now = Date.now()) {
    const clean = String(title ?? "").trim();
    if (!clean) throw new Error("Task title is required.");
    if (clean.length > 120) throw new Error("Task title must be 120 characters or fewer.");
    if (!PRIORITIES.includes(priority)) throw new Error(`Priority must be one of: ${PRIORITIES.join(", ")}.`);
    if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) throw new Error("Due date must be YYYY-MM-DD.");
    return {
      id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      title: clean,
      priority,
      due: due || "",
      done: false,
      createdAt: now,
    };
  }

  function toggleTask(tasks, id) {
    return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function removeTask(tasks, id) {
    return tasks.filter((t) => t.id !== id);
  }

  function clearCompleted(tasks) {
    return tasks.filter((t) => !t.done);
  }

  function filterTasks(tasks, filter = "all", query = "") {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filter === "active" && t.done) return false;
      if (filter === "done" && !t.done) return false;
      return !q || t.title.toLowerCase().includes(q);
    });
  }

  /** Active first, then by priority, then by due date (no date last), then newest. */
  function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (p) return p;
      if (a.due !== b.due) {
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due < b.due ? -1 : 1;
      }
      return b.createdAt - a.createdAt;
    });
  }

  function stats(tasks) {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    return { total, done, active: total - done, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  function isOverdue(task, today = new Date().toISOString().slice(0, 10)) {
    return Boolean(task.due) && !task.done && task.due < today;
  }

  const api = { PRIORITIES, createTask, toggleTask, removeTask, clearCompleted, filterTasks, sortTasks, stats, isOverdue };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Tasks = api;
})(typeof window !== "undefined" ? window : globalThis);
