// TASK: import helper functions from utils
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";

// TASK: import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

//localStorage.clear();

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.getElementsByClassName("column-div"),
  editTaskModalWindow: document.getElementsByClassName("edit-task-modal-window")[0],
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  newTaskModalWindow: document.getElementById("new-task-modal-window")
  
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  initializeData();
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  Array.from(elements.columnDivs).forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    newToggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  const createTaskButton = document.getElementById("create-task-btn");
  createTaskButton.addEventListener('click', () => {
    newToggleModal(false);
  })

  // Clicking outside the modal to close it
  document.addEventListener('mousedown', (event) => {
    if (!elements.editTaskModalWindow.contains(event.target) && !elements.newTaskModalWindow.contains(event.target)) {
      toggleModal(false);
      newToggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    }
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(true));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(false));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    newToggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event);
  });


}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.editTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

function newToggleModal(show, modal = elements.newTaskModalWindow){
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  // Assign user input to the task object
  const titleInput = document.getElementById('title-input').value;
  const descInput = document.getElementById('desc-input').value;
  const statusSelect = document.getElementById('select-status').value;

  const task = {
      title: titleInput,
      description: descInput,
      status: statusSelect,
      board: activeBoard // Add the active board to the task
  };

  const newTask = createNewTask(task);
  if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
  }
}

function toggleSidebar(show) {
  // Implement sidebar toggle functionality here
  const sidebar = document.querySelector('.side-bar');

  if (!show) {
    sidebar.classList.add('show-sidebar');
    elements.hideSideBarBtn.style.display = 'block';
    elements.showSideBarBtn.style.display = 'none';
  } else {
    sidebar.classList.remove('show-sidebar');
    elements.hideSideBarBtn.style.display = 'none';
    elements.showSideBarBtn.style.display = 'block';
  }

}

function toggleTheme() {
  // Implement theme toggle functionality here
  // Select elements that should have their theme toggled
  const body = document.body;

  // Check current theme state (for example, stored in a variable or retrieved from local storage)
  const isLightTheme = body.classList.contains('light-theme');

  // Toggle between light and dark themes
  if (isLightTheme) {
    // If currently in light theme, switch to dark theme
    body.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    // If currently in dark theme, switch to light theme
    body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  }
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  updateTaskDetailsInModal(task);

  // Get button elements from the task modal
  const saveChangesButton = document.getElementById('save-task-changes-btn');
  const deleteTaskButton = document.getElementById('delete-task-btn');

  // Define the event listener function for saving changes
  function handleSavingTheChanges() {
    saveTaskChanges(task.id);
    // Remove the event listener after saving the task
    saveChangesButton.removeEventListener('click', handleSavingTheChanges);
  }

  // Add event listener for Save Changes button
  saveChangesButton.addEventListener('click', handleSavingTheChanges);

  // Implement logic to delete task using a helper function, if required
  deleteTaskButton.addEventListener('click', function() {
    // Call a helper function to delete the task based on its ID
    deleteTask(task.id);
    const existingTaskElement = document.querySelector(`.task-div[data-task-id="${task.id}"]`);
    existingTaskElement.remove();
    toggleModal(false); // Close the task modal after deleting the task
  });

  // Show the edit task modal
  toggleModal(true);
}


function updateTaskDetailsInModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descriptionInput = document.getElementById('edit-task-desc-input');
  const statusSelect = document.getElementById('edit-select-status');

  titleInput.value = task.title;
  descriptionInput.value = task.description; // Include description
  statusSelect.value = task.status;
}

function saveTaskChanges(taskId) {
  // Get new user input for status
  const statusInput = document.getElementById('edit-select-status').value;
  const titleInput = document.getElementById('edit-task-title-input').value;
  const descriptionInput = document.getElementById('edit-task-desc-input').value;
  // Fetch the existing task from local storage
  const tasks = getTasks();
  const taskToUpdate = tasks.find(task => task.id === taskId);

  // Update only the status of the task
  taskToUpdate.status = statusInput;
  taskToUpdate.title = titleInput;
  taskToUpdate.description = descriptionInput;

  // Update the task in local storage
  patchTask(taskId, taskToUpdate);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
