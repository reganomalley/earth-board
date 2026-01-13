// Manages anonymous user sessions using localStorage
const SESSION_KEY = 'viral-canvas-session-id';

export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    // Generate a simple UUID v4
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
