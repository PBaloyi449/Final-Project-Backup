// TASK: Import helper functions from utils
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";

// TASK: Import initialData
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
  newTaskModalWindow: document.getElementById("new-task-modal-window"),
  sideLogoImage: document.getElementById("logo")
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  initializeData(); // Calls the initializeData function
  const tasks = getTasks(); // Retrieves tasks from local storage
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))]; // Extracts unique board names
  displayBoards(boards); // Displays boards on the UI
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard")); // Retrieves active board from local storage
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; // Assigns active board
    elements.headerBoardName.textContent = activeBoard; // Sets the header with active board name
    styleActiveBoard(activeBoard); // Styles the active board
    refreshTasksUI(); // Refreshes tasks UI based on active board
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div"); // Retrieves boards container from the DOM
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button"); // Creates a button element for each board
    boardElement.textContent = board; // Sets the text content of the button to the board name
    boardElement.classList.add("board-btn"); // Adds a CSS class to the button
    boardElement.addEventListener('click', () => { // Adds click event listener to each board button
      elements.headerBoardName.textContent = board; // Sets the header with the clicked board name
      filterAndDisplayTasksByBoard(board); // Filters and displays tasks based on the clicked board
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard)); // Stores active board in local storage
      styleActiveBoard(activeBoard); // Styles the active board
    });
    boardsContainer.appendChild(boardElement); // Appends the board button to the container
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Retrieves tasks from local storage
  const filteredTasks = tasks.filter(task => task.board === boardName); // Filters tasks based on board name

  Array.from(elements.columnDivs).forEach(column => { // Iterates over each column
    const status = column.getAttribute("data-status"); // Retrieves the status of the column
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`; // Sets the inner HTML of the column

    const tasksContainer = document.createElement("div"); // Creates a container for tasks
    column.appendChild(tasksContainer); // Appends the tasks container to the column

    filteredTasks.filter(task => task.status === status).forEach(task => { // Filters tasks based on status
      const taskElement = document.createElement("div"); // Creates a task element
      taskElement.classList.add("task-div"); // Adds a CSS class to the task element
      taskElement.textContent = task.title; // Sets the text content of the task element to the task title
      taskElement.setAttribute('data-task-id', task.id); // Sets a data attribute for task ID

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { // Adds click event listener to each task
        openEditTaskModal(task); // Opens edit task modal for the clicked task
      });

      tasksContainer.appendChild(taskElement); // Appends the task element to the tasks container
    });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard); // Refreshes tasks UI based on active board
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // Selects all board buttons
    if(btn.textContent === boardName) { // Checks if button text matches active board name
      btn.classList.add('active'); // Adds 'active' class to the button
    } else {
      btn.classList.remove('active'); // Removes 'active' class from other buttons
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); // Selects column based on task status
  if (!column) {
    console.error(`Column not found for status: ${task.status}`); // Logs error if column is not found
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container'); // Selects tasks container within the column
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`); // Logs warning if tasks container is not found
    tasksContainer = document.createElement('div'); // Creates a tasks container element
    tasksContainer.className = 'tasks-container'; // Adds CSS class to the tasks container
    column.appendChild(tasksContainer); // Appends the tasks container to the column
  }

  const taskElement = document.createElement('div'); // Creates a task element
  taskElement.className = 'task-div'; // Adds CSS class to the task element
  taskElement.textContent = task.title; // Sets the text content of the task element to the task title
  taskElement.setAttribute('data-task-id', task.id); // Sets a data attribute for task ID
  
  tasksContainer.appendChild(taskElement); // Appends the task element to the tasks container 
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn'); // Retrieves cancel edit button
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn'); // Retrieves cancel add task button
  cancelAddTaskBtn.addEventListener('click', () => {
    newToggleModal(false); // Hides new task modal
    elements.filterDiv.style.display = 'none'; // Hides the filter overlay
  });

  const createTaskButton = document.getElementById("create-task-btn"); // Retrieves create task button
  createTaskButton.addEventListener('click', () => {
    newToggleModal(false); // Hides new task modal
  })

  // Clicking outside the modal to close it
  document.addEventListener('mousedown', (event) => {
    if (!elements.editTaskModalWindow.contains(event.target) && !elements.newTaskModalWindow.contains(event.target)) {
      toggleModal(false); // Hides edit task modal
      newToggleModal(false); // Hides new task modal
      elements.filterDiv.style.display = 'none'; // Hides the filter overlay
    }
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(true)); // Adds event listener for hiding sidebar
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(false)); // Adds event listener for showing sidebar

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme); // Adds event listener for theme switch

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    newToggleModal(true); // Shows new task modal
    elements.filterDiv.style.display = 'block'; // Shows the filter overlay
  });

  // Add new task form submission event listener
  elements.newTaskModalWindow.addEventListener('submit',  (event) => {
    addTask(event); // Adds event listener for adding new task
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.editTaskModalWindow) {
  modal.style.display = show ? 'block' : 'none'; // Shows or hides the modal based on 'show' parameter
}

function newToggleModal(show, modal = elements.newTaskModalWindow){
  modal.style.display = show ? 'block' : 'none'; // Shows or hides the modal based on 'show' parameter
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); // Prevents default form submission behavior

  // Assign user input to the task object
  const titleInput = document.getElementById('title-input').value; // Retrieves task title input
  const descInput = document.getElementById('desc-input').value; // Retrieves task description input
  const statusSelect = document.getElementById('select-status').value; // Retrieves task status input

  const task = {
      title: titleInput,
      description: descInput,
      status: statusSelect,
      board: activeBoard // Add the active board to the task
  };

  const newTask = createNewTask(task); // Creates a new task
  if (newTask) {
      addTaskToUI(newTask); // Adds new task to the UI
      toggleModal(false); // Hides the modal
      elements.filterDiv.style.display = 'none'; // Hides the filter overlay
      event.target.reset(); // Resets the form
      refreshTasksUI(); // Refreshes tasks UI
  }
}

function toggleSidebar(show) {
  // Implement sidebar toggle functionality here
  const sidebar = document.querySelector('.side-bar'); // Retrieves the sidebar element

  if (!show) {
    sidebar.classList.add('show-sidebar'); // Adds 'show-sidebar' class to show the sidebar
    elements.hideSideBarBtn.style.display = 'block'; // Displays hide sidebar button
    elements.showSideBarBtn.style.display = 'none'; // Hides show sidebar button
  } else {
    sidebar.classList.remove('show-sidebar'); // Removes 'show-sidebar' class to hide the sidebar
    elements.hideSideBarBtn.style.display = 'none'; // Hides hide sidebar button
    elements.showSideBarBtn.style.display = 'block'; // Displays show sidebar button
  }

  localStorage.setItem('showSideBar', show.toString()); // Stores sidebar visibility state in local storage

}

function toggleTheme() {
  // Implement theme toggle functionality here
  // Select elements that should have their theme toggled
  const body = document.body; // Retrieves the body element

  // Check current theme state (for example, stored in a variable or retrieved from local storage)
  const isLightTheme = body.classList.contains('light-theme'); // Checks if body has 'light-theme' class

  // Toggle between light and dark themes
  if (isLightTheme) {
    // If currently in light theme, switch to dark theme
    body.classList.remove('light-theme'); // Removes 'light-theme' class
    localStorage.setItem('theme', 'dark'); // Stores theme preference in local storage
    elements.sideLogoImage.src='./assets/logo-dark.svg'; // Changes logo source to dark theme
    localStorage.setItem('logo', './assets/logo-dark.svg'); // Stores logo path in local storage
  } else {
    // If currently in dark theme, switch to light theme
    body.classList.add('light-theme'); // Adds 'light-theme' class
    localStorage.setItem('theme', 'light'); // Stores theme preference in local storage
    elements.sideLogoImage.src = './assets/logo-light.svg'; // Changes logo source to light theme
    localStorage.setItem('logo', './assets/logo-light.svg'); // Stores logo path in local storage
  }
}

function openEditTaskModal(task) {
  // Set task details in modal inputs
  updateTaskDetailsInModal(task);

  // Get button elements from the task modal
  const saveChangesButton = document.getElementById('save-task-changes-btn'); // Retrieves save changes button
  const deleteTaskButton = document.getElementById('delete-task-btn'); // Retrieves delete task button

  // Define the event listener function for saving changes
  function handleSavingTheChanges() {
    saveTaskChanges(task.id); // Saves task changes
    // Remove the event listener after saving the task
    saveChangesButton.removeEventListener('click', handleSavingTheChanges);
  }

  // Add event listener for Save Changes button
  saveChangesButton.addEventListener('click', handleSavingTheChanges);

  // Implement logic to delete task using a helper function, if required
  deleteTaskButton.addEventListener('click', function() {
    // Call a helper function to delete the task based on its ID
    deleteTask(task.id); // Deletes task
    const existingTaskElement = document.querySelector(`.task-div[data-task-id="${task.id}"]`); // Retrieves task element
    existingTaskElement.remove(); // Removes task element from the UI
    toggleModal(false); // Closes the task modal after deleting the task
  });

  // Show the edit task modal
  toggleModal(true); // Shows the task modal
}


function updateTaskDetailsInModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById('edit-task-title-input'); // Retrieves edit task title input
  const descriptionInput = document.getElementById('edit-task-desc-input'); // Retrieves edit task description input
  const statusSelect = document.getElementById('edit-select-status'); // Retrieves edit task status input

  titleInput.value = task.title; // Sets value of edit task title input
  descriptionInput.value = task.description; // Sets value of edit task description input
  statusSelect.value = task.status; // Sets value of edit task status input
}

function saveTaskChanges(taskId) {
  // Get new user input for status
  const statusInput = document.getElementById('edit-select-status').value; // Retrieves updated status input
  const titleInput = document.getElementById('edit-task-title-input').value; // Retrieves updated title input
  const descriptionInput = document.getElementById('edit-task-desc-input').value; // Retrieves updated description input
  // Fetch the existing task from local storage
  const tasks = getTasks(); // Retrieves tasks from local storage
  const taskToUpdate = tasks.find(task => task.id === taskId); // Finds the task to update based on ID

  // Update task properties
  taskToUpdate.status = statusInput; // Updates status
  taskToUpdate.title = titleInput; // Updates title
  taskToUpdate.description = descriptionInput; // Updates description

  // Update the task in local storage
  patchTask(taskId, taskToUpdate); // Patches the task in local storage

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal); // Closes edit task modal
  refreshTasksUI(); // Refreshes tasks UI
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // Calls the init function after the DOM is fully loaded
});

function init() {
  setupEventListeners(); // Sets up event listeners
  const showSidebar = localStorage.getItem('showSideBar') === 'true'; // Retrieves sidebar visibility state
  toggleSidebar(showSidebar); // Toggles sidebar visibility
  const isLightTheme = localStorage.getItem('theme'); // Retrieves theme preference from local storage
  if (isLightTheme === 'light'){
    document.body.classList.add('light-theme'); // Adds 'light-theme' class to body
  }

  const logo = localStorage.getItem('logo'); // Retrieves logo path from local storage
  if (logo) {
    elements.sideLogoImage.src = logo; // Sets logo source
  }

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
