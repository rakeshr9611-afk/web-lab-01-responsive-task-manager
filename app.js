/* UI layer: wires the DOM to the pure functions in tasks.js */
(function () {
  const { createTask, toggleTask, removeTask, clearCompleted, filterTasks, sortTasks, stats, isOverdue } = window.Tasks;
  const STORAGE_KEY = "weblab01.tasks";
  const THEME_KEY = "weblab01.theme";

  const $ = (sel) => document.querySelector(sel);
  const form = $("#task-form");
  const titleInput = $("#task-title");
  const errorEl = $("#form-error");
  const list = $("#task-list");
  const empty = $("#empty-state");
  const template = $("#task-template");
  const search = $("#search");

  let tasks = load();
  let filter = "all";

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function update(next) {
    tasks = next;
    save();
    render();
  }

  function formatDue(due) {
    return new Date(`${due}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function render() {
    const visible = sortTasks(filterTasks(tasks, filter, search.value));
    list.replaceChildren(
      ...visible.map((task) => {
        const li = template.content.firstElementChild.cloneNode(true);
        li.dataset.id = task.id;
        li.classList.toggle("done", task.done);
        li.classList.toggle("overdue", isOverdue(task));
        const check = li.querySelector(".task-check");
        check.checked = task.done;
        check.setAttribute("aria-label", `Mark "${task.title}" as ${task.done ? "not done" : "done"}`);
        li.querySelector(".task-title").textContent = task.title;
        const badge = li.querySelector(".badge");
        badge.textContent = task.priority;
        badge.classList.add(`badge-${task.priority}`);
        const dueEl = li.querySelector(".task-due");
        if (task.due) {
          dueEl.dateTime = task.due;
          dueEl.textContent = (isOverdue(task) ? "Overdue · " : "Due ") + formatDue(task.due);
        } else dueEl.remove();
        li.querySelector(".task-delete").setAttribute("aria-label", `Delete "${task.title}"`);
        return li;
      })
    );
    empty.hidden = visible.length > 0;

    const s = stats(tasks);
    $("#stat-total").textContent = s.total;
    $("#stat-active").textContent = s.active;
    $("#stat-done").textContent = s.done;
    $("#progress-bar").style.width = `${s.percent}%`;
    $("#clear-done").disabled = s.done === 0;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const task = createTask({ title: data.get("title"), priority: data.get("priority"), due: data.get("due") });
      errorEl.hidden = true;
      form.reset();
      titleInput.focus();
      update([...tasks, task]);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
      titleInput.focus();
    }
  });

  // Event delegation for checkbox + delete
  list.addEventListener("change", (e) => {
    if (e.target.matches(".task-check")) update(toggleTask(tasks, e.target.closest(".task").dataset.id));
  });
  list.addEventListener("click", (e) => {
    if (e.target.matches(".task-delete")) update(removeTask(tasks, e.target.closest(".task").dataset.id));
  });

  document.querySelectorAll(".chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      render();
    })
  );

  search.addEventListener("input", render);
  $("#clear-done").addEventListener("click", () => update(clearCompleted(tasks)));

  // Theme: saved choice, else OS preference
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $("#theme-toggle").addEventListener("click", () => {
    const current =
      document.documentElement.dataset.theme ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });

  render();
})();
