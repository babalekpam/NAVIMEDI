
// Force clear supplier session from localStorage
localStorage.removeItem('userType');
localStorage.removeItem('token');
localStorage.removeItem('user');
sessionStorage.clear();
console.log('Supplier session cleared');
window.location.reload();

