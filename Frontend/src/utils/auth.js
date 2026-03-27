
export const saveAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};


export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};


export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};


export const isAuthenticated = () => {
  return !!getAuthToken();
};


export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};


export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};


export const removeUser = () => {
  localStorage.removeItem('user');
};


export const clearAuth = () => {
  removeAuthToken();
  removeUser();
};
