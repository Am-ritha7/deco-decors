document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // Clear any previous error message
    errorMessage.textContent = '';

    // Fixed credentials for admin
    const fixedUsername = 'admin';
    const fixedPassword = 'admin123';

    // Validate credentials
    if (username === fixedUsername && password === fixedPassword) {

      window.location.href = 'dashboard.html';
    } else {
      // Display error message
      errorMessage.textContent = 'Invalid username or password.';
    }
  });
