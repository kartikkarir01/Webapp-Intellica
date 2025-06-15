document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignupFormLink = document.getElementById('showSignupForm');
    const showLoginFormLink = document.getElementById('showLoginForm');
    
    // Switch to signup form
    showSignupFormLink.addEventListener('click', () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    });

    // Switch to login form
    showLoginFormLink.addEventListener('click', () => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // Handle login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Check if credentials match (mock validation)
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.username === username && storedUser.password === password) {
            alert('Login successful!');
            localStorage.setItem('isLoggedIn', true);  // Set login session
            window.location.href = 'index.html';  // Redirect to index page
        } else {
            alert('Invalid credentials!');
        }
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        // Store the new user in localStorage
        const newUser = { username: newUsername, password: newPassword };
        localStorage.setItem('user', JSON.stringify(newUser));

        alert('Sign up successful! You can now log in.');
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
});
