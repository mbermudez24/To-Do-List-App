document.addEventListener('DOMContentLoaded', function () {
    // Retrieve HTML elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    // Load tasks from local storage when the page is loaded
    loadTasks();

    // Add event listeners for adding tasks and drag-and-drop functionality
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keyup', addTask);
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragenter', handleDragEnter);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('dragleave', handleDragLeave);
    taskList.addEventListener('drop', handleDrop);

    /**
     * Function to add a new task
     * @param {Event} event - The keyup event (Enter key)
     */
    function addTask(event) {
        if (event.key === 'Enter') {
            const taskText = taskInput.value.trim();
            if (taskText === '') return;

            // Create a new task item
            const taskItem = document.createElement('li');
            taskItem.innerHTML = `
                <span>${taskText}</span>
                <button class="deleteBtn">Delete</button>
                <button class="completeBtn">Complete</button>
            `;

            // Append the new task item to the task list
            taskList.appendChild(taskItem);

            // Clear the input field after adding a task
            taskInput.value = '';

            // Get references to the delete and complete buttons within the new task item
            const deleteBtn = taskItem.querySelector('.deleteBtn');
            const completeBtn = taskItem.querySelector('.completeBtn');

            // Attach click event listeners to the delete and complete buttons
            deleteBtn.addEventListener('click', deleteTask);
            completeBtn.addEventListener('click', toggleComplete);

            // Make the new task item draggable
            taskItem.draggable = true;

            // Save tasks to local storage
            saveTasks();
        }
    }

    /**
     * Function to delete a task
     */
    function deleteTask() {
        const taskItem = this.parentElement;
        // Remove the task item from the task list
        taskList.removeChild(taskItem);
        // Save tasks to local storage
        saveTasks();
    }

    /**
     * Function to toggle the completion status of a task
     */
    function toggleComplete() {
        const taskItem = this.parentElement;
        // Toggle the 'completed' class on the task item
        taskItem.classList.toggle('completed');
        // Save tasks to local storage
        saveTasks();
    }

    /**
     * Function to save tasks to local storage
     */
    function saveTasks() {
        // Create an array of tasks based on the current state of the task list
        const tasks = Array.from(taskList.children).map(taskItem => ({
            text: taskItem.querySelector('span').innerText,
            completed: taskItem.classList.contains('completed')
        }));
        /*taskList.children retrieves a live HTMLCollection of the child elements (task items) of the taskList.

             Array.from(...) converts the HTMLCollection into a standard array.

             The map function iterates over each task item in the array and creates an object for each item with two properties:

             text: The text content of the task (extracted from the <span> element).
             completed: A boolean indicating whether the task is marked as completed (based on the presence of the 'completed' class).
        */

        // Save the tasks array to local storage as JSON
        localStorage.setItem('tasks', JSON.stringify(tasks));


        /*localStorage is a property that allows you to access a Storage object for the current domain.
        
        setItem is a method of the Storage interface (which includes both localStorage and sessionStorage).*/
    }

    /**
     * Function to load tasks from local storage
     */
    function loadTasks() {
        // Retrieve tasks array from local storage and parse it as JSON
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        // Iterate through the tasks array and create task items
        tasks.forEach(task => {
            // Create a new task item
            const taskItem = document.createElement('li');
            taskItem.innerHTML = `
                <span>${task.text}</span>
                <button class="deleteBtn">Delete</button>
                <button class="completeBtn">Complete</button>
            `;

            // Append the new task item to the task list
            taskList.appendChild(taskItem);

            // Add the 'completed' class if the task was marked as completed
            if (task.completed) {
                taskItem.classList.add('completed');
            }

            // Get references to the delete and complete buttons within the loaded task item
            const deleteBtn = taskItem.querySelector('.deleteBtn');
            const completeBtn = taskItem.querySelector('.completeBtn');

            // Attach click event listeners to the delete and complete buttons
            deleteBtn.addEventListener('click', deleteTask);
            completeBtn.addEventListener('click', toggleComplete);

            // Make the loaded task item draggable
            taskItem.draggable = true;
        });
    }

    /**
     * Function to handle the start of a drag operation
     * @param {DragEvent} event - The dragstart event
     */
    function handleDragStart(event) {
        // Set the dragged data (task text) and the dragged element (task item)
        event.dataTransfer.setData('text/plain', event.target.querySelector('span').innerText);
        event.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Function to handle when a dragged item enters a potential drop target
     * @param {DragEvent} event - The dragenter event
     */
    function handleDragEnter(event) {
        // Highlight the potential drop target when a dragged item enters it
        event.target.classList.add('drag-over');
    }

    /**
     * Function to handle dragging over a potential drop target
     * @param {DragEvent} event - The dragover event
     */
    function handleDragOver(event) {
        // Prevent the default behavior to allow a drop
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    /**
     * Function to handle when a dragged item leaves a potential drop target
     * @param {DragEvent} event - The dragleave event
     */
    function handleDragLeave(event) {
        // Remove the 'drag-over' class when a dragged item leaves the potential drop target
        event.target.classList.remove('drag-over');
    }

    /**
     * Function to handle the drop of a dragged item onto a target
     * @param {DragEvent} event - The drop event
     */
    function handleDrop(event) {
        // Prevent the default behavior to avoid the drop outside of the target
        event.preventDefault();

        // Remove the 'drag-over' class
        event.target.classList.remove('drag-over');

        // Get the dragged data (task text)
        const draggedText = event.dataTransfer.getData('text/plain');

        // Find the dragged task item
        const draggedItem = findTaskItemByText(draggedText);

        // Find the drop target task item
        const dropTarget = event.target.closest('li');

        // Move the dragged item before or after the drop target depending on the position
        if (draggedItem && dropTarget) {
            if (event.clientY < dropTarget.getBoundingClientRect().top + dropTarget.clientHeight / 2) {
                taskList.insertBefore(draggedItem, dropTarget);
            } else {
                taskList.insertBefore(draggedItem, dropTarget.nextElementSibling);
            }

            // Save tasks to local storage after the drag-and-drop operation
            saveTasks();
        }
    }

    /**
     * Function to find a task item based on its text content
     * @param {string} text - The text content to search for
     * @returns {Element|null} - The found task item or null if not found
     */
    function findTaskItemByText(text) {
        const taskItems = taskList.children;
        for (let i = 0; i < taskItems.length; i++) {
            const taskItemText = taskItems[i].querySelector('span').innerText;
            if (taskItemText === text) {
                return taskItems[i];
            }
        }
        return null;
    }
});
