$(document).ready(function () {
  // App State
  let tasks = JSON.parse(localStorage.getItem("crudUtils_tasks")) || [];
  let isEditing = false;

  // DOM Elements
  const $taskForm = $("#task-form");
  const $taskId = $("#task-id");
  const $taskTitle = $("#task-title");
  const $taskDesc = $("#task-desc");
  const $taskStatus = $("#task-status");
  const $taskList = $("#task-list");
  const $saveBtn = $("#save-btn");
  const $cancelBtn = $("#cancel-btn");
  const $taskCount = $(".task-count");

  // Initial Render
  renderTasks();

  // Event Listeners
  $taskForm.on("submit", handleSave);
  $cancelBtn.on("click", resetForm);

  // Delegate events for dynamically added elements
  $taskList.on("click", ".edit-btn", handleEditClick);
  $taskList.on("click", ".delete-btn", handleDeleteClick);

  // Save or Update Task (CREATE / UPDATE)
  function handleSave(e) {
    e.preventDefault();

    const title = $taskTitle.val().trim();
    const desc = $taskDesc.val().trim();
    const status = $taskStatus.val();
    const id = $taskId.val();

    if (!title) return;

    if (isEditing && id) {
      // Update existing
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          id,
          title,
          desc,
          status,
          updatedAt: new Date().toISOString(),
        };
      }
    } else {
      // Create new
      const newTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        title,
        desc,
        status,
        createdAt: new Date().toISOString(),
      };
      tasks.unshift(newTask);
    }

    saveToLocalStorage();
    renderTasks();
    resetForm();
  }

  // Populate form for editing
  function handleEditClick() {
    const id = $(this).closest(".task-item").data("id");
    const task = tasks.find((t) => t.id === id);

    if (task) {
      $taskId.val(task.id);
      $taskTitle.val(task.title);
      $taskDesc.val(task.desc);
      $taskStatus.val(task.status);

      isEditing = true;
      $saveBtn.text("Update Task");
      $cancelBtn.slideDown(200);

      // Scroll to form smoothly
      $("html, body").animate(
        {
          scrollTop: $(".app-container").offset().top - 20,
        },
        500,
      );

      $taskTitle.focus();
    }
  }

  // Delete Task (DELETE)
  function handleDeleteClick() {
    if (confirm("Are you sure you want to delete this task?")) {
      const $item = $(this).closest(".task-item");
      const id = $item.data("id");

      // Animate out
      $item.css("animation", "fadeOut 0.3s ease forwards");

      setTimeout(() => {
        tasks = tasks.filter((t) => t.id !== id);
        saveToLocalStorage();
        renderTasks();

        // If editing the deleted item, reset form
        if (isEditing && $taskId.val() === id) {
          resetForm();
        }
      }, 300);
    }
  }

  // RESET Form
  function resetForm() {
    $taskForm[0].reset();
    $taskId.val("");
    isEditing = false;
    $saveBtn.text("Add Task");
    $cancelBtn.slideUp(200);
  }

  // Storage
  function saveToLocalStorage() {
    localStorage.setItem("crudUtils_tasks", JSON.stringify(tasks));
  }

  // Render List (READ)
  function renderTasks() {
    $taskList.empty();

    $taskCount.text(`${tasks.length} Task${tasks.length !== 1 ? "s" : ""}`);

    if (tasks.length === 0) {
      $taskList.append(`
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    <p>No tasks yet. Add one above!</p>
                </div>
            `);
      return;
    }

    tasks.forEach((task) => {
      const statusClass = `status-${task.status.toLowerCase().replace(" ", "-")}`;

      const html = `
                <div class="task-item" data-id="${task.id}">
                    <div class="task-header">
                        <div class="task-title">${escapeHTML(task.title)}</div>
                        <span class="task-status-badge ${statusClass}">${escapeHTML(task.status)}</span>
                    </div>
                    ${task.desc ? `<div class="task-desc">${escapeHTML(task.desc).replace(/\n/g, "<br>")}</div>` : ""}
                    <div class="task-actions">
                        <button class="action-btn edit-btn">Edit</button>
                        <button class="action-btn delete-btn">Delete</button>
                    </div>
                </div>
            `;
      $taskList.append(html);
    });
  }

  // Utility to prevent XSS
  function escapeHTML(str) {
    return $("<div>").text(str).html();
  }
});
