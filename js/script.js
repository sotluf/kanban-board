const modal = document.querySelector(".confirm-modal");
const taskModal = document.querySelector(".task-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

let currentColumn = null;
let currentTask = null;
let darkmode = localStorage.getItem("darkmode");
const themeSwitch = document.getElementById("theme-switch");

// DARK MODE
const enableDarkmode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
};

const disableDarkmode = () => {
  document.body.classList.remove("darkmode");
  localStorage.removeItem("darkmode");
};

if (darkmode === "active") {
  enableDarkmode();
}

themeSwitch.addEventListener("click", () => {
  darkmode = localStorage.getItem("darkmode");
  darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

// LOCAL STORAGE
const getTasksData = () => {
  const data = [];

  columns.forEach((column) => {
    const tasks = column.querySelectorAll(".task");
    data.push([...tasks].map((task) => JSON.parse(task.dataset.task)));
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

    col.forEach((taskObj) => tasksEl.appendChild(createTask(taskObj)));
  });
};

// FORMATING, SORTING, FILTERING
const formatDeadline = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

const isOverdue = (dateStr) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return deadline < today;
};

const priorityOrder = { Undefined: 0, Low: 1, Medium: 2, High: 3 };

const sortTasks = (column, mode) => {
  const tasksEl = column.querySelector(".tasks");
  const tasks = [...tasksEl.querySelectorAll(".task")];

  if (mode === "none") return;

  tasks.sort((a, b) => {
    const dataA = JSON.parse(a.dataset.task);
    const dataB = JSON.parse(b.dataset.task);

    if (mode === "priority-asc") {
      return priorityOrder[dataA.priority] - priorityOrder[dataB.priority];
    }
    if (mode === "priority-desc") {
      return priorityOrder[dataB.priority] - priorityOrder[dataA.priority];
    }

    const deadlineA = dataA.deadline ? new Date(dataA.deadline) : null;
    const deadlineB = dataB.deadline ? new Date(dataB.deadline) : null;

    if (!deadlineA && !deadlineB) return 0;
    if (!deadlineA) return 1;
    if (!deadlineB) return -1;

    return mode === "deadline-asc"
      ? deadlineA - deadlineB
      : deadlineB - deadlineA;
  });

  tasks.forEach((task) => tasksEl.appendChild(task));
  saveTasks();
};

//create html element for task
const createTask = (data) => {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;
  task.dataset.task = JSON.stringify(data);

  task.innerHTML = `
   <div class="task-nav"> 
        ${data.priority ? `<span class="priority ${data.priority}">${data.priority}</span>` : ""}
        ${
          data.deadline
            ? `<span class="deadline${isOverdue(data.deadline) ? " overdue" : ""}">${formatDeadline(data.deadline)}</span>`
            : ""
        }
    </div>

    <h4>${data.title}</h4>
    ${data.description ? `<p>${data.description}</p>` : ""}
   
    <menu>
        <button data-edit><i class="bi bi-pencil"></i></button>
        <button data-delete><i class="bi bi-x-lg"></i></button>
    </menu>`;

  task.addEventListener("dragstart", handleDragstart);
  task.addEventListener("dragend", handleDragend);

  return task;
};

// ADD, EDIT, DELETE TASKS
const handleDelete = (event) => {
  currentTask = event.target.closest(".task");
  const data = JSON.parse(currentTask.dataset.task);

  modal.querySelector(".preview").innerText = data.title;
  modal.showModal();
};

const handleEdit = (event) => {
  currentTask = event.target.closest(".task");
  const data = JSON.parse(currentTask.dataset.task);

  taskModal.querySelector("h3").textContent = "Edit Task";
  const form = taskModal.querySelector("form");
  form.querySelector("#task-title").value = data.title;
  form.querySelector("#task-description").value = data.description;
  form.querySelector("#task-priority").value = data.priority;
  form.querySelector("#task-due-date").value = data.deadline;

  taskModal.showModal();
};

taskModal.querySelector("form").addEventListener("submit", (event) => {
  const formData = new FormData(event.target);

  const data = {
    title: formData.get("task-title"),
    description: formData.get("task-description"),
    priority: formData.get("task-priority"),
    deadline: formData.get("task-due-date"),
  };

  if (currentTask) {
    currentTask.replaceWith(createTask(data));
  } else {
    currentColumn.appendChild(createTask(data));
  }

  saveTasks();
});

const handleAdd = (event) => {
  currentColumn = event.target.closest(".column").querySelector(".tasks");
  currentTask = null;
  taskModal.querySelector("h3").textContent = "Add Task";
  taskModal.querySelector("form").reset();
  taskModal.showModal();
};

// modal actions for delete
modal.addEventListener("submit", () => {
  if (currentTask) {
    currentTask.remove();
    saveTasks();
  }
});
modal
  .querySelector("#delete-cancel")
  .addEventListener("click", () => modal.close());
modal.addEventListener("close", () => (currentTask = null));

// modal actions for add/edit
taskModal
  .querySelector("#task-cancel")
  .addEventListener("click", () => taskModal.close());

taskModal.addEventListener("close", () => {
  currentTask = null;
  currentColumn = null;
});

// TASK COUNT
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

// DRAG AND DROP
// when dragging over a task or tasks container
const handleDragover = (event) => {
  event.preventDefault();

  const draggedTask = document.querySelector(".dragging");
  const target = event.target.closest(".task, .tasks");

  if (!target || target === draggedTask) return;

  if (target.classList.contains("tasks")) {
    const lastTask = target.lastElementChild;
    if (!lastTask) {
      target.appendChild(draggedTask);
    } else {
      const { bottom } = lastTask.getBoundingClientRect();
      event.clientY > bottom && target.appendChild(draggedTask);
    }
  } else {
    const { top, height } = target.getBoundingClientRect();
    const distance = top + height / 2;

    if (event.clientY < distance) {
      target.before(draggedTask);
    } else {
      target.after(draggedTask);
    }
  }
};

const handleDrop = (event) => {
  event.preventDefault();
};

const handleDragend = (event) => {
  event.target.classList.remove("dragging");
  saveTasks();
};

const handleDragstart = (event) => {
  event.dataTransfer.dropEffect = "move";
  event.dataTransfer.setData("text/plain", "");
  requestAnimationFrame(() => event.target.classList.add("dragging"));
};

const tasksElements = columnsContainer.querySelectorAll(".tasks");
for (const tasksEl of tasksElements) {
  tasksEl.addEventListener("dragover", handleDragover);
  tasksEl.addEventListener("drop", handleDrop);
}

// EVENT DELEGATION
// event listener for add, edit, delete and toggle buttons
columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);
  } else if (event.target.closest("button[data-filter]")) {
    const dropdown = event.target
      .closest(".filter-wrapper")
      .querySelector(".filter-dropdown");
    dropdown.classList.toggle("open");
  } else {
    document
      .querySelectorAll(".filter-dropdown.open")
      .forEach((d) => d.classList.remove("open"));
  }
});

columnsContainer.addEventListener("change", (event) => {
  if (event.target.matches(".sort-option")) {
    const column = event.target.closest(".column");
    sortTasks(column, event.target.value);
  }
});

// INIT
loadTasks();
