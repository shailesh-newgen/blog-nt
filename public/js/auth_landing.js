const data = JSON.parse(localStorage.getItem('data'));
if (!data) {
    window.location = 'login';
}
