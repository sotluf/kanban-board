const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

let currentTask = null;

// function

const handleDelete = (event) => {
  currentTask = event.target.closest(".task");

  // show preview
  modal.querySelector(".preview").innerText = currentTask.innerText.substring(
    0,
    100,
  );
  modal.showModal();
};

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

const handleBlur = (event) => {
  const input = event.target;
  const content = input.innerHTML.trim() || "Untitled";
  const task = createTask(content);
  input.replaceWith(task);
};

const handleAdd = (event) => {
  const tasksEl = event.target.closest(".column").lastElementChild;
  const input = createTaskInput();
  tasksEl.appendChild(input);
  input.focus();
};

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
  return task;
};

const createTaskInput = (text = "") => {
  const input = document.createElement("div");
  input.className = "task-input";
  input.dataset.placeholder = "Task name";
  input.contentEditable = true;
  input.innerText = text;
  input.addEventListener("blur", handleBlur);
  return input;
};

// add, edit and delete task
columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  } else if (event.target.closest("button[data-edit]")) {
    handleEdit(event);
  } else if (event.target.closest("button[data-delete]")) {
    handleDelete(event);
  }
});

// confirm deletion
modal.addEventListener("submit", () => currentTask && currentTask.remove());
// cancel deletion
modal.querySelector("#cancel").addEventListener("click", () => modal.close());
// clear current task
modal.addEventListener("close", () => (currentTask = null));
