document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const addSampleTasksBtn = document.getElementById('add-sample-tasks');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const filterBtns = document.querySelectorAll('.filter-item[data-filter]');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const pendingTasksEl = document.getElementById('pending-tasks');

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Initial render
    renderTasks();
    updateStats();

    // Add task event
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Add sample tasks
    addSampleTasksBtn.addEventListener('click', () => {
        tasks = [
            { id: Date.now() + 1, text: 'Complete project proposal', completed: false, priority: 'high', date: new Date().toISOString() },
            { id: Date.now() + 2, text: 'Buy groceries', completed: false, priority: 'medium', date: new Date().toISOString() },
            { id: Date.now() + 3, text: 'Go for a run', completed: false, priority: 'low', date: new Date().toISOString() }
        ];
        saveTasks();
        renderTasks();
        updateStats();
    });

    // Filter event listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all filter buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current filter
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Clear completed tasks
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateStats();
    });

    // Add task function
    function addTask() {
        const text = taskInput.value.trim();
        const priority = prioritySelect.value;
        
        if (text) {
            const newTask = {
                id: Date.now(),
                text,
                completed: false,
                priority,
                date: new Date().toISOString()
            };
            
            tasks.unshift(newTask); // Add to beginning of array
            saveTasks();
            renderTasks();
            updateStats();
            
            // Reset input
            taskInput.value = '';
            taskInput.focus();
        }
    }

    // Toggle task completion
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
        updateStats();
    }

    // Delete task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        updateStats();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Render tasks based on current filter
    function renderTasks() {
        // Check if tasks array is empty
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
            taskList.innerHTML = '';
            taskList.appendChild(emptyState);
            return;
        }
        
        // Hide empty state
        emptyState.style.display = 'none';
        
        // Filter tasks
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Clear task list
        taskList.innerHTML = '';
        
        // Add filtered tasks
        filteredTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            // Format date
            const taskDate = new Date(task.date);
            const formattedDate = taskDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            taskEl.innerHTML = `
                <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-text">${task.text}</div>
                    <div class="task-meta">
                        <span>${formattedDate}</span>
                        <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <div class="task-delete">🗑️</div>
                </div>
            `;
            
            // Add event listeners
            taskEl.querySelector('.task-check').addEventListener('change', () => {
                toggleTask(task.id);
            });
            
            taskEl.querySelector('.task-delete').addEventListener('click', () => {
                deleteTask(task.id);
            });
            
            taskList.appendChild(taskEl);
        });
        
        // If filtered tasks are empty but there are tasks, show a message
        if (filteredTasks.length === 0 && tasks.length > 0) {
            const noTasksEl = document.createElement('div');
            noTasksEl.className = 'empty-state';
            noTasksEl.innerHTML = `
                <p>No ${currentFilter} tasks found</p>
            `;
            taskList.appendChild(noTasksEl);
        }
    }

    // Update stats
    function updateStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        totalTasksEl.textContent = totalTasks;
        completedTasksEl.textContent = completedTasks;
        pendingTasksEl.textContent = pendingTasks;
    }
});