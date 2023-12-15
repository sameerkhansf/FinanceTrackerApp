document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');
    const authButton = document.getElementById('authButton');
    const toggleButton = document.getElementById('toggleButton');
    let isLogin = false; // Flag to track if the form is in login mode

    // Toggle between Login and Signup
    toggleButton.addEventListener('click', function() {
        isLogin = !isLogin;
        authButton.textContent = isLogin ? 'Login' : 'Create Account';
        toggleButton.textContent = isLogin ? 'Switch to Signup' : 'Switch to Login';
    });

    // Handle Form Submission
    authForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;

        const endpoint = isLogin ? '/login' : '/createAccount';
        const successRedirect = '/transactions';
        const failureMessage = isLogin ? 'Login failed' : 'Signup failed';

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        })
        .then(response => {
            if (response.ok) {
                window.location.href = successRedirect;
            } else {
                alert(failureMessage);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
