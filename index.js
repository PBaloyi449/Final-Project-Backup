// TASK: import helper functions from utils
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './taskFunction.js';

// TASK: import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

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
  navigationSidebar: document.getElementById("side-bar-div"),
  button: document.getElementById("show-side-bar-btn"),
  mainLayout: document.getElementById("layout"),
  formForAddingNewTask: document.getElementById("new-task-modal-window"),
  editTaskModal: document.getElementById("edit-task-modal-window"), // Corrected modal ID
  filterDiv: document.getElementById("filterDiv"),
  headerBoardName: document.getElementById("header-board-name"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
  themeSwitch: document.getElementById("switch"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  modalWindow: document.getElementById("modal-window"), // Added missing modal window element
  columnDivs: document.querySelectorAll('.column-div') // Added column divs reference
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
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
    boardElement.addEventListener('click', () =>  { 
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

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    const columnHeader = column.querySelector(".columnHeader");
    columnHeader.textContent = status.toUpperCase();

    const tasksContainer = column.querySelector(".tasks-container");
    tasksContainer.innerHTML = ""; // Clear existing tasks

    tasks.filter(task => task.board === boardName && task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        const task = getTaskById(task.id); // Implement a function to get task details by ID
        if (task) {
          openEditTaskModal(task);
        }
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
    }
    else {
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
  elements.cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn'); // Corrected button ID
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event);
  });

  // Save task changes button event listener
  elements.saveTaskChangesBtn.addEventListener('click', () => {
    const taskId = document.getElementById('edit-task-id').value;
    saveTaskChanges(taskId);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
  const title = document.getElementById("title-input").value;
  const description = document.getElementById("desc-input").value;
  const status = document.getElementById("select-status").value;

  const task = {
     title: title,
     description: description,
     status: status
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

function openEditTaskModal(task) {
  // Populate the edit modal with task details
  document.getElementById('edit-task-id').value = task.id;
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  // Show the edit modal
  toggleModal(true, elements.editTaskModal);
}

function saveTaskChanges(taskId) {
  // Get updated task details from the edit modal
  const title = document.getElementById('edit-task-title-input').value;
  const description = document.getElementById('edit-task-desc-input').value;
  const status = document.getElementById('edit-select-status').value;

  // Update the task details in the data model
  const updatedTask = {
    id: taskId,
    title: title,
    description: description,
    status: status
  };
  // Implement a function to update task details by ID
  patchTask(taskId, updatedTask);

  // Close the edit modal
  toggleModal(false, elements.editTaskModal);

  // Refresh the UI to reflect the changes
  refreshTasksUI();
}

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  initializeData(); // Call the initialization function to ensure data consistency
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
