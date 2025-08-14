// Vulnerable TodoList Frontend JavaScript
// Educational application with intentional security vulnerabilities

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Will be updated for production

// VULNERABILITY: Hardcoded API URL and sensitive configuration exposed
// WARNING: In production, sensitive configuration should be properly managed

// Global variables (VULNERABILITY: Global state management)
let currentUser = null;
let tasks = [];
let editingTaskId = null;
let deletingTaskId = null;
let debugMode = true; // VULNERABILITY: Debug mode enabled in production

// DOM elements
let tasksContainer, loadingIndicator, emptyState, alertArea;
let addTaskForm, editTaskForm, searchInput, filterSelect;
let editTaskModal, deleteTaskModal;

// Application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Vulnerable TodoList App Initialized');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Check authentication
    checkAuthentication();
    
    // Add event listeners
    addEventListeners();
    
    // Load initial data
    loadTasks();
});

// Initialize DOM elements
function initializeDOMElements() {
    tasksContainer = document.getElementById('tasksContainer');
    loadingIndicator = document.getElementById('loadingIndicator');
    emptyState = document.getElementById('emptyState');
    alertArea = document.getElementById('alertArea');
    
    addTaskForm = document.getElementById('addTaskForm');
    editTaskForm = document.getElementById('editTaskForm');
    searchInput = document.getElementById('searchTasks');
    filterSelect = document.getElementById('filterTasks');
    
    editTaskModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    deleteTaskModal = new bootstrap.Modal(document.getElementById('deleteTaskModal'));
}

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!token || !userInfo) {
        // Redirect to auth page if not logged in
        window.location.href = 'auth.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userInfo);
        document.getElementById('username').textContent = currentUser.username || 'Usuario';
    } catch (error) {
        console.error('Error parsing user info:', error);
        logout();
    }
}

// Add event listeners
function addEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Add task form
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
    }
    
    // Edit task form
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', handleEditTask);
    }
    
    // Search and filter
    if (searchInput) {
        searchInput.addEventListener('input', filterTasks);
    }
    
    if (filterSelect) {
        filterSelect.addEventListener('change', filterTasks);
    }
    
    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteTask);
}

// Load tasks from API
async function loadTasks() {
    try {
        showLoading(true);
        
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            tasks = await response.json();
            renderTasks();
        } else if (response.status === 401) {
            showAlert('Sesión expirada. Por favor, inicia sesión nuevamente.', 'warning');
            logout();
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error al cargar las tareas', 'danger');
        }
        
    } catch (error) {
        // VULNERABILITY: Detailed error logging in production
        console.error('Error loading tasks:', error);
        if (debugMode) {
            console.log('Full error details:', error.stack);
            console.log('Current user:', currentUser);
            console.log('Auth token:', localStorage.getItem('authToken'));
        }
        showAlert('Error de conexión. Verifica que el backend esté ejecutándose.', 'danger');
    } finally {
        showLoading(false);
    }
}

// Render tasks in the UI
function renderTasks(filteredTasks = null) {
    const tasksToRender = filteredTasks || tasks;
    
    if (tasksToRender.length === 0) {
        tasksContainer.style.display = 'none';
        emptyState.style.display = 'block';
        updateTaskCount(0);
        return;
    }
    
    tasksContainer.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Render tasks (VULNERABLE TO XSS - intentional for educational purposes)
    // WARNING: This code is intentionally vulnerable to demonstrate XSS attacks
    // In a real application, you should sanitize user input and use textContent instead of innerHTML
    tasksContainer.innerHTML = tasksToRender.map(task => `
        <div class="list-group-item d-flex justify-content-between align-items-start">
            <div class="ms-2 me-auto">
                <div class="d-flex align-items-center mb-1">
                    <input class="form-check-input me-2" type="checkbox" 
                           ${task.completed ? 'checked' : ''} 
                           onchange="toggleTaskStatus(${task.id}, this.checked)">
                    <h6 class="mb-0 ${task.completed ? 'text-decoration-line-through text-muted' : ''}">
                        ${task.title}
                    </h6>
                    ${task.completed ? '<span class="badge bg-success ms-2">Completada</span>' : '<span class="badge bg-warning text-dark ms-2">Pendiente</span>'}
                </div>
                ${task.description ? `<p class="mb-1 text-muted">${task.description}</p>` : ''}
                <small class="text-muted">
                    <i class="bi bi-calendar"></i> 
                    Creada: ${formatDate(task.created_at)}
                    ${task.updated_at !== task.created_at ? ` | Actualizada: ${formatDate(task.updated_at)}` : ''}
                </small>
            </div>
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-outline-primary btn-sm" 
                        onclick="openEditModal(${task.id})" title="Editar">
                    <i class="bi bi-pencil"></i>
                </button>
                <button type="button" class="btn btn-outline-danger btn-sm" 
                        onclick="openDeleteModal(${task.id})" title="Eliminar">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    updateTaskCount(tasksToRender.length);
}

// Handle add task form submission
async function handleAddTask(event) {
    event.preventDefault();
    
    const formData = new FormData(addTaskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description') || ''
    };
    
    // VULNERABILITY: No client-side validation - intentional for educational purposes
    // WARNING: In a secure application, you should validate input on both client and server side
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert('Tarea agregada exitosamente', 'success');
            addTaskForm.reset();
            loadTasks(); // Reload tasks
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error al agregar la tarea', 'danger');
        }
        
    } catch (error) {
        console.error('Error adding task:', error);
        showAlert('Error de conexión', 'danger');
    }
}

// Toggle task completion status
async function toggleTaskStatus(taskId, completed) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });
        
        if (response.ok) {
            // Update local task data
            const taskIndex = tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = completed;
                renderTasks();
            }
            
            showAlert(`Tarea marcada como ${completed ? 'completada' : 'pendiente'}`, 'success');
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error al actualizar la tarea', 'danger');
            loadTasks(); // Reload to reset state
        }
        
    } catch (error) {
        console.error('Error toggling task:', error);
        showAlert('Error de conexión', 'danger');
        loadTasks(); // Reload to reset state
    }
}

// Open edit modal
function openEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    
    // Populate form
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskCompleted').checked = task.completed;
    
    editTaskModal.show();
}

// Handle edit task form submission
async function handleEditTask(event) {
    event.preventDefault();
    
    const formData = new FormData(editTaskForm);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        completed: formData.has('completed')
    };
    
    // VULNERABILITY: No client-side validation for edit operations - intentional
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/tasks/${editingTaskId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            showAlert('Tarea actualizada exitosamente', 'success');
            editTaskModal.hide();
            loadTasks(); // Reload tasks
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error al actualizar la tarea', 'danger');
        }
        
    } catch (error) {
        console.error('Error updating task:', error);
        showAlert('Error de conexión', 'danger');
    }
}

// Open delete confirmation modal
function openDeleteModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    deletingTaskId = taskId;
    
    // Show task details in modal (VULNERABLE TO XSS - intentional)
    // WARNING: This is intentionally vulnerable to demonstrate XSS
    document.getElementById('taskToDelete').innerHTML = `
        <strong>${task.title}</strong>
        ${task.description ? `<br><small class="text-muted">${task.description}</small>` : ''}
    `;
    
    deleteTaskModal.show();
}

// Handle task deletion
async function handleDeleteTask() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/tasks/${deletingTaskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            showAlert('Tarea eliminada exitosamente', 'success');
            deleteTaskModal.hide();
            loadTasks(); // Reload tasks
        } else {
            const error = await response.json();
            showAlert(error.detail || 'Error al eliminar la tarea', 'danger');
        }
        
    } catch (error) {
        console.error('Error deleting task:', error);
        showAlert('Error de conexión', 'danger');
    }
}

// Filter tasks based on search and filter criteria
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;
    
    let filteredTasks = tasks;
    
    // VULNERABILITY: Client-side filtering only - no server-side search validation
    // Apply search filter
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            (task.description && task.description.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply status filter
    if (filterValue !== 'all') {
        filteredTasks = filteredTasks.filter(task => {
            if (filterValue === 'completed') return task.completed;
            if (filterValue === 'pending') return !task.completed;
            return true;
        });
    }
    
    // VULNERABILITY: Log search terms (potential data leakage)
    if (debugMode && searchTerm) {
        console.log('User searched for:', searchTerm);
        console.log('Results found:', filteredTasks.length);
    }
    
    renderTasks(filteredTasks);
}

// Utility functions
function showLoading(show) {
    if (show) {
        loadingIndicator.style.display = 'block';
        tasksContainer.style.display = 'none';
        emptyState.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

function updateTaskCount(count) {
    const taskCountElement = document.getElementById('taskCount');
    if (taskCountElement) {
        taskCountElement.textContent = `${count} tarea${count !== 1 ? 's' : ''}`;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAlert(message, type) {
    // VULNERABLE TO XSS - intentional for educational purposes
    // WARNING: This function is vulnerable to XSS attacks through the message parameter
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${getAlertIcon(type)}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertArea.innerHTML = alertHtml;
    
    // Auto-dismiss success alerts after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            const alert = alertArea.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 3000);
    }
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function logout() {
    // VULNERABILITY: Insecure logout - no server-side token invalidation
    // WARNING: In a secure application, you should invalidate tokens on the server
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    
    // Additional vulnerability: No session cleanup
    // sessionStorage is not cleared, cookies are not cleared
    
    // Redirect to auth page
    window.location.href = 'auth.html';
}

// VULNERABILITY: Exposed utility functions that could be exploited
function getStoredToken() {
    // This function exposes the token to any script that can call it
    return localStorage.getItem('authToken');
}

function setDebugMode(enabled) {
    // VULNERABILITY: Debug mode can be enabled by any script
    debugMode = enabled;
    console.log('Debug mode:', enabled ? 'enabled' : 'disabled');
}

function executeUnsafeCode(code) {
    // VULNERABILITY: Dangerous eval-like functionality
    // WARNING: This is extremely dangerous and should never exist in real applications
    if (debugMode) {
        try {
            return eval(code);
        } catch (error) {
            console.error('Code execution error:', error);
        }
    }
}

// VULNERABILITY: Expose internal functions to global scope
window.getStoredToken = getStoredToken;
window.setDebugMode = setDebugMode;
window.executeUnsafeCode = executeUnsafeCode;