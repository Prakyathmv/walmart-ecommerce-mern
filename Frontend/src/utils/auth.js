// Save authentication token
export const saveAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Get authentication token
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Remove authentication token
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Save user data
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user data
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user data
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Clear all auth data
export const clearAuth = () => {
  removeAuthToken();
  removeUser();
};
