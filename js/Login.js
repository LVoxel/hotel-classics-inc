document.addEventListener('DOMContentLoaded', function () {
    const path = window.location.pathname;
    const isLogin = path.endsWith('login.html');
    const isIndex = path.endsWith('index.html') || path === '/';

    // if (!isLogin && !isIndex) {
    //     const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //     if (!currentUser) {
    //         window.location.href = 'login.html';
    //     }
    // }
});


document.addEventListener('DOMContentLoaded', function () {
    const loginBtn = document.getElementById('login-btn');
    const userSection = document.getElementById('user-section');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        loginBtn.textContent = currentUser.name;
        loginBtn.href = '#';
        loginBtn.classList.add('username-display');

        // Показываем кнопку Admin Panel, если isAdmin
        if (currentUser.isAdmin) {
            const adminBtn = document.createElement('a');
            adminBtn.textContent = 'Admin Panel';
            adminBtn.classList.add('btn');
            adminBtn.href = 'admin.html';
            userSection.appendChild(adminBtn);
        }

        const logoutBtn = document.createElement('a');
        logoutBtn.textContent = 'Logout';
        logoutBtn.classList.add('btn');
        logoutBtn.href = '#';
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('currentUser');
            location.reload();
        });

        userSection.appendChild(logoutBtn);
    }
});

function checkUserExists() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    fetch('users.php')
        .then(res => res.json())
        .then(users => {
            const exists = users.some(u => String(u.id) === String(currentUser.id));
            if (!exists) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
}

// Проверка при загрузке каждой страницы
document.addEventListener('DOMContentLoaded', checkUserExists);

function loginUser(email, password) {
    fetch('users.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Login successful!', 'success');
                localStorage.setItem('currentUser', JSON.stringify(data));
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1200);
            }
        });
}