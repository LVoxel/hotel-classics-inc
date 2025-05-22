function showNotification(message, type = 'error') {
  const notification = document.getElementById('notification');
  notification.textContent = message;

  let bgColor = '#e74c3c';

  if (type === 'success') bgColor = '#2ecc71';      // зелёный
  else if (type === 'info') bgColor = '#3498db';    // синий
  else if (type === 'warning') bgColor = '#f39c12'; // оранжевый

  notification.style.backgroundColor = bgColor;

  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 400);
  }, 3000);
}
