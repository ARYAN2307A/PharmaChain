export const getToken = () => localStorage.getItem("token");

export const getRole = () => localStorage.getItem("role");

export const isAuthenticated = () => Boolean(getToken());

export const getUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
};
