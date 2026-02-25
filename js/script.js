const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

let currentTask = null;
let darkmode = localStorage.getItem("darkmode");
const themeSwitch = document.getElementById("theme-switch");

// 1. function for drag and drop, darkmode toggle

// when dragging over a task or tasks container
const handleDragover = (event) => {
  event.preventDefault(); // allow drop

  const draggedTask = document.querySelector(".dragging");
  const target = event.target.closest(".task, .tasks");

  if (!target || target === draggedTask) return;

  if (target.classList.contains("tasks")) {
    // target is the tasks element
    const lastTask = target.lastElementChild;
    if (!lastTask) {
      // tasks empty
      target.appendChild(draggedTask);
    } else {
      const { bottom } = lastTask.getBoundingClientRect();
      event.clientY > bottom && target.appendChild(draggedTask);
    }
  } else {
    // target is another task
    const { top, height } = target.getBoundingClientRect();
    const distance = top + height / 2;

    if (event.clientY < distance) {
      target.before(draggedTask);
    } else {
      target.after(draggedTask);
    }
  }
};

// when dropping a task
const handleDrop = (event) => {
  event.preventDefault();
};

// when dragging ends
const handleDragend = (event) => {
  event.target.classList.remove("dragging");
  saveTasks();
};

// start dragging a task
const handleDragstart = (event) => {
  event.dataTransfer.dropEffect = "move";
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => event.target.classList.add("dragging"));
};

// toggle dark mode
const enableDarkmode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
};

const disableDarkmode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkmode", null);
};

if (darkmode === "active") {
  enableDarkmode();
}

// save and load tasks data to local storage
const getTasksData = () => {
  const data = [];

  columns.forEach((column) => {
    const tasks = column.querySelectorAll(".task > div:first-child");
    data.push([...tasks].map((task) => task.innerText));
  });

  return data;
};

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(getTasksData()));
};

const loadTasks = () => {
  const data = JSON.parse(localStorage.getItem("tasks"));
  if (!data) return;

  data.forEach((col, idx) => {
    const tasksEl = columns[idx].querySelector(".tasks");
    tasksEl.innerHTML = ""; // clear existing tasks

    col.forEach((taskText) => tasksEl.appendChild(createTask(taskText)));
  });
};

// 2. functions for edit and delete task

// delete task
const handleDelete = (event) => {
  currentTask = event.target.closest(".task");

  // show preview
  modal.querySelector(".preview").innerText = currentTask.innerText.substring(
    0,
    100,
  );
  modal.showModal();
};

// edit task
const handleEdit = (event) => {
  const task = event.target.closest(".task");
  const input = createTaskInput(task.innerText);
  task.replaceWith(input);
  input.focus();

  //move cursor to the end
  const selection = window.getSelection();
  selection.selectAllChildren(input);
  selection.collapseToEnd();
};

// finish editing task and create a new task element
const handleBlur = (event) => {
  const input = event.target;
  const content = input.innerHTML.trim() || "Untitled";
  const task = createTask(content);
  input.replaceWith(task);
  saveTasks();
};

// 3. functions for add task

const handleAdd = (event) => {
  const tasksEl = event.target.closest(".column").lastElementChild;
  const input = createTaskInput();
  tasksEl.appendChild(input);
  input.focus();
};

// 4. observe changes in tasks and update task count in column title

// update task count in column title
const updateTaskCount = (column) => {
  const tasks = column.querySelector(".tasks").children;
  const taskCount = tasks.length;
  column.querySelector(".column-title h3").dataset.tasks = taskCount;
};

// automatically update task count
const observeTaskChanges = () => {
  for (const column of columns) {
    const observer = new MutationObserver(() => updateTaskCount(column));
    observer.observe(column.querySelector(".tasks"), { childList: true });
  }
};

observeTaskChanges();

// 5. helper functions to create task and task input elements

//create html element for task
const createTask = (content) => {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.innerHTML = `
    <div>${content}</div>
    <menu>
        <button data-edit><i class="bi bi-pencil-square"></i></button>
        <button data-delete><i class="bi bi-trash"></i></button>
    </menu>`;
  task.addEventListener("dragstart", handleDragstart);
  task.addEventListener("dragend", handleDragend);

  return task;
};

// create input element for editing or adding task
const createTaskInput = (text = "") => {
  const input = document.createElement("div");
  input.className = "task-input";
  input.dataset.placeholder = "Task name";
  input.contentEditable = true;
  input.innerText = text;
  input.addEventListener("blur", handleBlur);
  return input;
};

// 6. event listeners for drag and drop
const tasksElements = columnsContainer.querySelectorAll(".tasks");
for (const tasksEl of tasksElements) {
  tasksEl.addEventListener("dragover", handleDragover);
  tasksEl.addEventListener("drop", handleDrop);
}

// 7. event listener for add, edit, delete and toggle buttons
columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);
  }
});

themeSwitch.addEventListener("click", () => {
  darkmode = localStorage.getItem("darkmode");
  darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

// modal actions for delete
modal.addEventListener("submit", () => {
  if (currentTask) {
    currentTask.remove();
    saveTasks();
  }
});
modal.querySelector("#cancel").addEventListener("click", () => modal.close());
modal.addEventListener("close", () => (currentTask = null));

// 8. get tasks data from local storage when page loads
loadTasks();
