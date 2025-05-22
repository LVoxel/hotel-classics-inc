document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

    if (!currentUser && !isIndexPage) {
        window.location.href = 'login.html';
    }
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
    fetch(`http://localhost:3001/api/users`)
        .then(res => res.json())
        .then(users => {
            const exists = users.some(u => u.id === currentUser.id);
            if (!exists) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
}

// Проверка при загрузке каждой страницы
document.addEventListener('DOMContentLoaded', checkUserExists);