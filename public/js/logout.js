function logout() {
    localStorage.removeItem('data');
    window.location = '../login';
}
