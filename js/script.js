const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector(".columns");
const columns = columnsContainer.querySelectorAll(".column");

// function

const handleBlur = (event) => {
  const input = event.target;
  const content = input.innerText.trim() || "Untitled";
  const task = createTask(content.replace(/\n/g, "<br>"));
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

// task input

columnsContainer.addEventListener("click", (event) => {
  if (event.target.closest("button[data-add]")) {
    handleAdd(event);
  }
});
