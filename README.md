# Kanban Board

A clean, responsive, and persistent Kanban board created with vanilla HTML, CSS, and JavaScript. This project provides a simple and intuitive interface for managing tasks across four distinct stages: To do, In progress, In review, and Done.

Live Demo: https://sotluf.github.io/kanban-board/

## Table of contents
1. [Features](#features)
2. [How to Use](#how-to-use)
3. [How It Works](#how-it-works)
4. [File Structure](#file-structure)

## Features

*   **Drag & Drop:** Easily move tasks between columns or reorder them within a column.
*   **CRUD Operations:**
    *   **Create:** Add new tasks directly to any column.
    *   **Edit:** Click the edit icon to modify task content in place.
    *   **Delete:** Remove tasks with a confirmation dialog to prevent accidental deletion.
*   **Data Persistence:** Your tasks are automatically saved to the browser's local storage, so you won't lose your progress when you close the tab or refresh the page.
*   **Light & Dark Mode:** Toggle between a light and dark theme using the theme switch button. Your preference is saved in local storage.
*   **Dynamic Task Counter:** The header of each column automatically updates to show the current number of tasks it contains.
*   **Responsive Design:** The layout adapts smoothly from desktop to mobile devices.
*   **Zero Dependencies:** Built entirely with vanilla JavaScript, HTML, and CSS.

## How to Use

To get started with this Kanban board, simply clone the repository and open the `index.html` file in your web browser.

```bash
git clone https://github.com/sotluf/kanban-board.git
cd kanban-board
# Open index.html in your browser
```

## How It Works

### Task Management

-   **Adding a task:** Click the `+` button at the top of any column. An input field will appear where you can type your task. Click outside the input field to save.
-   **Editing a task:** Hover over a task to reveal the menu. Click the `pencil icon` to edit the task's text directly.
-   **Deleting a task:** Click the `trash icon`. A confirmation modal will appear to prevent accidental deletion.

### Drag and Drop

Click and hold a task to drag it. You can move it to a different position within the same column or drop it into another column to change its status.

### Local Storage

All tasks and the current theme `light/dark` are saved in your browser's local storage. This ensures that your board state is preserved between sessions. The `saveTasks()` function serializes the task data into a JSON string and stores it, while `loadTasks()` retrieves and renders the data when the page is loaded.

## File Structure

-   `index.html`: The main HTML file that defines the structure of the Kanban board, including the columns, task containers, and the delete confirmation modal.
-   `css/style.css`: Contains all the styling for the application. It uses CSS variables and is fully responsive.
-   `js/script.js`: The core logic of the application. This vanilla JavaScript file handles all functionality.
