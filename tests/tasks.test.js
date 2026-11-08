const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../tasks.js");

test("createTask trims title and applies defaults", () => {
  const t = T.createTask({ title: "  Buy milk  " }, 1000);
  assert.equal(t.title, "Buy milk");
  assert.equal(t.priority, "medium");
  assert.equal(t.done, false);
  assert.equal(t.createdAt, 1000);
});

test("createTask rejects bad input", () => {
  assert.throws(() => T.createTask({ title: "   " }), /required/);
  assert.throws(() => T.createTask({ title: "x".repeat(121) }), /120/);
  assert.throws(() => T.createTask({ title: "a", priority: "urgent" }), /Priority/);
  assert.throws(() => T.createTask({ title: "a", due: "tomorrow" }), /YYYY-MM-DD/);
});

test("toggle, remove and clearCompleted do not mutate input", () => {
  const a = T.createTask({ title: "a" }, 1);
  const b = T.createTask({ title: "b" }, 2);
  const list = [a, b];
  const toggled = T.toggleTask(list, a.id);
  assert.equal(toggled[0].done, true);
  assert.equal(list[0].done, false);
  assert.deepEqual(T.removeTask(list, a.id), [b]);
  assert.deepEqual(T.clearCompleted(toggled).map((t) => t.id), [b.id]);
});

test("filterTasks by status and search query", () => {
  const list = [
    { ...T.createTask({ title: "Write report" }), done: true },
    T.createTask({ title: "Read book" }),
  ];
  assert.equal(T.filterTasks(list, "active").length, 1);
  assert.equal(T.filterTasks(list, "done").length, 1);
  assert.equal(T.filterTasks(list, "all", "READ").length, 1);
  assert.equal(T.filterTasks(list, "all", "zzz").length, 0);
});

test("sortTasks: active first, then priority, then due date", () => {
  const mk = (title, priority, due, done = false) => ({ ...T.createTask({ title, priority, due }), done });
  const sorted = T.sortTasks([
    mk("done-high", "high", "", true),
    mk("low", "low", ""),
    mk("high-late", "high", "2030-01-02"),
    mk("high-early", "high", "2030-01-01"),
    mk("high-nodue", "high", ""),
  ]);
  assert.deepEqual(sorted.map((t) => t.title), ["high-early", "high-late", "high-nodue", "low", "done-high"]);
});

test("stats and isOverdue", () => {
  const list = [{ done: true }, { done: false }, { done: false }, { done: true }];
  assert.deepEqual(T.stats(list), { total: 4, done: 2, active: 2, percent: 50 });
  assert.deepEqual(T.stats([]), { total: 0, done: 0, active: 0, percent: 0 });
  assert.equal(T.isOverdue({ due: "2020-01-01", done: false }, "2026-01-01"), true);
  assert.equal(T.isOverdue({ due: "2020-01-01", done: true }, "2026-01-01"), false);
  assert.equal(T.isOverdue({ due: "", done: false }, "2026-01-01"), false);
});
