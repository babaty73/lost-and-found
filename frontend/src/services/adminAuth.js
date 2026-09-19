// Small helper around the two localStorage keys that make up an admin
// session. There is no student-facing equivalent of this file on purpose —
// students never authenticate (see the architecture notes in the project
// report for why).

const TOKEN_KEY = "astu_admin_token";
const USER_KEY = "astu_admin_user";

export function saveAdminSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}
