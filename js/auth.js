// Authentication JavaScript for Vulnerable TodoList
// Educational application with intentional security vulnerabilities

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Will be updated for production

// VULNERABILITY: Hardcoded configuration and debug settings
const DEBUG_MODE = true;
const ADMIN_BACKDOOR = 'admin123'; // VULNERABILITY: Hardcoded backdoor

// DOM elements
let loginForm, registerForm, alertArea;

// Initialize authentication page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth page initialized');
    
    // Get DOM elements
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    alertArea = document.getElementById('alertArea');
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Check if user is already logged in
    checkAuthStatus();
});

// Check if user is already authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Redirect to dashboard if already logged in
        window.location.href = 'index.html';
    }
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    // VULNERABILITY: Admin backdoor check
    if (loginData.username === 'admin' && loginData.password === ADMIN_BACKDOOR) {
        // Simulate admin login without server verification
        const fakeAdminToken = 'admin-token-' + Date.now();
        localStorage.setItem('authToken', fakeAdminToken);
        localStorage.setItem('userInfo', JSON.stringify({
            id: 1,
            username: 'admin',
            email: 'admin@vulnerable-app.com',
            role: 'admin'
        }));
        showAlert('¡Acceso de administrador concedido!', 'success');
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }
    
    // VULNERABILITY: Log credentials in debug mode
    if (DEBUG_MODE) {
        console.log('Login attempt:', loginData);
    }
    
    try {
        showAlert('Iniciando sesión...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // VULNERABILITY: Store credentials for "convenience"
            storeUserCredentials(loginData.username, loginData.password);
            
            // VULNERABILITY: Insecure token storage in localStorage
            // WARNING: localStorage is accessible via JavaScript and persists across sessions
            // Secure applications should use httpOnly cookies or secure session management
            localStorage.setItem('authToken', result.access_token);
            localStorage.setItem('userInfo', JSON.stringify(result.user_info));
            
            // Additional vulnerability: Store sensitive data in sessionStorage too
            sessionStorage.setItem('lastLogin', new Date().toISOString());
            sessionStorage.setItem('userRole', result.user_info.role || 'user');
            
            showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            showAlert(result.detail || 'Error en el inicio de sesión', 'danger');
        }
        
    } catch (error) {
        // VULNERABILITY: Detailed error logging exposes sensitive information
        console.error('Login error:', error);
        if (DEBUG_MODE) {
            console.log('Full error stack:', error.stack);
            console.log('Login data:', loginData);
            console.log('API endpoint:', `${API_BASE_URL}/auth/login`);
        }
        showAlert('Error de conexión. Verifica que el backend esté ejecutándose.', 'danger');
    }
}

// Handle register form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(registerForm);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // VULNERABILITY: Weak client-side validation - intentional for educational purposes
    // WARNING: Client-side validation can be easily bypassed
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden', 'danger');
        return;
    }
    
    // Weak password validation (no complexity requirements)
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
        return;
    }
    
    // No validation for:
    // - Username length or special characters
    // - Email format validation
    // - Password complexity (uppercase, numbers, special chars)
    // - Common password checking
    
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: password
    };
    
    try {
        showAlert('Registrando usuario...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showAlert('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');
            
            // Switch to login tab
            const loginTab = document.getElementById('login-tab');
            const loginTabInstance = new bootstrap.Tab(loginTab);
            loginTabInstance.show();
            
            // Clear register form
            registerForm.reset();
            
        } else {
            showAlert(result.detail || 'Error en el registro', 'danger');
        }
        
    } catch (error) {
        // VULNERABILITY: Detailed error logging in registration
        console.error('Register error:', error);
        if (DEBUG_MODE) {
            console.log('Registration data:', registerData);
            console.log('Error details:', error.message);
        }
        showAlert('Error de conexión. Verifica que el backend esté ejecutándose.', 'danger');
    }
}

// Show alert message
function showAlert(message, type) {
    // VULNERABILITY: XSS through alert messages - intentional for educational purposes
    // WARNING: This function is vulnerable to XSS attacks through the message parameter
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${getAlertIcon(type)}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertArea.innerHTML = alertHtml;
    
    // Auto-dismiss info alerts after 3 seconds
    if (type === 'info') {
        setTimeout(() => {
            const alert = alertArea.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 3000);
    }
}

// Get appropriate icon for alert type
function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Form validation helpers (intentionally basic for vulnerability demonstration)
function validateEmail(email) {
    // Basic email validation (vulnerable to bypass)
    return email.includes('@');
}

function validateUsername(username) {
    // Basic username validation (vulnerable)
    return username.length >= 3;
}

function validatePassword(password) {
    // Weak password validation (intentionally vulnerable)
    return password.length >= 6;
}

// VULNERABILITY: Additional insecure utility functions
function storeUserCredentials(username, password) {
    // VULNERABILITY: Store credentials in localStorage (extremely dangerous)
    if (DEBUG_MODE) {
        localStorage.setItem('lastUsername', username);
        localStorage.setItem('lastPassword', password); // Never do this!
    }
}

function getStoredCredentials() {
    // VULNERABILITY: Retrieve stored credentials
    return {
        username: localStorage.getItem('lastUsername'),
        password: localStorage.getItem('lastPassword')
    };
}

function bypassValidation() {
    // VULNERABILITY: Function to bypass client-side validation
    return true;
}

// VULNERABILITY: Expose functions globally
window.storeUserCredentials = storeUserCredentials;
window.getStoredCredentials = getStoredCredentials;
window.bypassValidation = bypassValidation;