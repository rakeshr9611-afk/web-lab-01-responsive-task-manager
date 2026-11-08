# Web Lab 01 — Responsive Task Manager

A responsive, accessible task manager built with **plain HTML, CSS and JavaScript**: no frameworks, no build step.

## Objectives

- Build a mobile-first responsive layout with **CSS Grid** and **Flexbox**
- Use **CSS custom properties** for theming (light/dark, following the OS preference)
- Manipulate the DOM with `<template>` cloning and **event delegation**
- Persist state with **localStorage**
- Keep business logic **pure and unit-tested**, separate from the UI
- Follow accessibility basics: labels, `aria-live`, `aria-pressed`, visible focus, reduced motion

## Features

| Feature | Details |
|---|---|
| Add tasks | Title, priority (low / medium / high), optional due date, with validation |
| Complete / delete | Checkbox toggle, delete button |
| Filter & search | All / Active / Done chips plus live text search |
| Smart sort | Active first, then by priority, then by due date |
| Overdue highlighting | Past-due open tasks are flagged in red |
| Stats | Total / active / done counts and a progress bar |
| Dark mode | Toggle button; the choice is remembered |
| Persistence | Tasks survive page reloads (localStorage) |

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Tests

The logic in `tasks.js` is pure (no DOM), so it runs in Node with the built-in test runner (Node 18+):

```bash
npm test
```

## Project structure

```
index.html          Markup + <template> for task rows
styles.css          Theme variables, responsive grid, components
tasks.js            Pure logic: create, toggle, filter, sort, stats (UMD: browser + Node)
app.js              UI layer: rendering, events, localStorage, theme
tests/tasks.test.js Unit tests (node:test)
```

## What I learned

- Separating pure logic from DOM code makes it easy to test without a browser.
- Event delegation on the list avoids attaching listeners to every row.
- `clamp()`, `min()` and Grid let the layout adapt without many media queries.
- Re-declaring CSS variables under `[data-theme]` gives theme switching with no JS styling.
