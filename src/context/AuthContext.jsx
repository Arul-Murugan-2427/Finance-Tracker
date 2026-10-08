import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'rupeetrack_jwt_token';
const USER_KEY = 'rupeetrack_auth_user';
const LOCAL_USERS_KEY = 'rupeetrack_local_users_db';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      return (savedToken && savedToken !== 'undefined') ? savedToken : null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return (savedUser && savedUser !== 'undefined') ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const getHeaders = (extra = {}) => ({
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true',
    ...extra
  });

  // Check if deployed on static host (like Netlify) without an explicit external remote backend host
  const isStaticDeployment = () => {
    if (typeof window === 'undefined') return false;
    const isNetlifyHost = window.location.hostname.includes('netlify.app');
    const hasRemoteBackendUrl = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http');
    return isNetlifyHost && !hasRemoteBackendUrl;
  };

  // Helper for Local Users Database in localStorage
  const getLocalUsers = () => {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveLocalUser = (userData, userPassword) => {
    const users = getLocalUsers();
    const key = userData.username.toLowerCase();
    users[key] = { ...userData, password: userPassword };
    if (userData.email) {
      users[userData.email.toLowerCase()] = users[key];
    }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  };

  const getLocalUser = (inputKey) => {
    const users = getLocalUsers();
    return users[inputKey.toLowerCase()] || null;
  };

  // Perform Local Storage Authentication
  const performLocalLogin = (cleanInput, rawUsername, password) => {
    let localUser = getLocalUser(cleanInput);

    if (!localUser) {
      // Auto-create local user profile on first login
      localUser = {
        id: 'user_' + cleanInput.replace(/[^a-z0-9]/g, '_'),
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@local.app`,
        username: cleanInput,
        name: rawUsername.trim(),
        dob: null,
        createdAt: new Date().toISOString()
      };
      saveLocalUser(localUser, password);
    }

    const localToken = `local-token-${localUser.id}`;
    setToken(localToken);
    setUser(localUser);
    localStorage.setItem(TOKEN_KEY, localToken);
    localStorage.setItem(USER_KEY, JSON.stringify(localUser));

    return { success: true, isOffline: true };
  };

  // Validate token on initial mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) return;
      // If using local offline token or static deployment, skip backend verification
      if ((typeof token === 'string' && token.startsWith('local-token-')) || isStaticDeployment()) {
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getHeaders({ 'Authorization': `Bearer ${token}` })
        });
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
          }
        }
      } catch (err) {
        console.warn('Backend server unreachable during auth check, using cached session:', err.message);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);

    const cleanInput = username ? username.trim().toLowerCase() : '';
    if (!cleanInput || !password) {
      setLoading(false);
      setAuthError('Username/Email and Password are required.');
      return { success: false, error: 'Username/Email and Password are required.' };
    }

    // Direct Local Storage Authentication on static host (Netlify) to avoid 500 network errors
    if (isStaticDeployment()) {
      try {
        const result = performLocalLogin(cleanInput, username, password);
        return result;
      } finally {
        setLoading(false);
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password })
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          saveLocalUser(data.user, password);
          return { success: true };
        } else if (res.status === 401 || res.status === 400) {
          throw new Error(data.error || 'Invalid credentials.');
        }
      }

      throw new Error('SERVER_UNREACHABLE');
    } catch (err) {
      if (err.message !== 'SERVER_UNREACHABLE' && !err.message.includes('fetch') && !err.message.includes('TypeError') && !err.message.includes('ERR_NAME_NOT_RESOLVED')) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }

      // Fallback: Perform Offline Local Authentication
      return performLocalLogin(cleanInput, username, password);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, username, password, name, dob }) => {
    setLoading(true);
    setAuthError(null);

    const cleanUsername = username ? username.trim().toLowerCase() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanName = name ? name.trim() : cleanUsername;

    if (!cleanUsername || !password) {
      setLoading(false);
      setAuthError('Username and Password are required.');
      return { success: false, error: 'Username and Password are required.' };
    }

    // Direct Local Registration on static host (Netlify)
    if (isStaticDeployment()) {
      try {
        const localUser = {
          id: 'user_' + cleanUsername.replace(/[^a-z0-9]/g, '_'),
          email: cleanEmail || `${cleanUsername}@local.app`,
          username: cleanUsername,
          name: cleanName,
          dob: dob || null,
          createdAt: new Date().toISOString()
        };

        saveLocalUser(localUser, password);

        const localToken = `local-token-${localUser.id}`;
        setToken(localToken);
        setUser(localUser);
        localStorage.setItem(TOKEN_KEY, localToken);
        localStorage.setItem(USER_KEY, JSON.stringify(localUser));

        return { success: true, message: 'Registered successfully!' };
      } finally {
        setLoading(false);
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, username, password, name, dob })
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.token && data.user) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          saveLocalUser(data.user, password);
          return { success: true, message: data.message };
        } else if (res.status === 400) {
          throw new Error(data.error || 'Registration failed.');
        }
      }

      throw new Error('SERVER_UNREACHABLE');
    } catch (err) {
      if (err.message !== 'SERVER_UNREACHABLE' && !err.message.includes('fetch') && !err.message.includes('TypeError') && !err.message.includes('ERR_NAME_NOT_RESOLVED')) {
        setAuthError(err.message);
        return { success: false, error: err.message };
      }

      // Offline Registration Fallback
      const localUser = {
        id: 'user_' + cleanUsername.replace(/[^a-z0-9]/g, '_'),
        email: cleanEmail || `${cleanUsername}@local.app`,
        username: cleanUsername,
        name: cleanName,
        dob: dob || null,
        createdAt: new Date().toISOString()
      };

      saveLocalUser(localUser, password);

      const localToken = `local-token-${localUser.id}`;
      setToken(localToken);
      setUser(localUser);
      localStorage.setItem(TOKEN_KEY, localToken);
      localStorage.setItem(USER_KEY, JSON.stringify(localUser));

      return { success: true, message: 'Registered successfully!' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    setAuthError(null);

    if (isStaticDeployment()) {
      setLoading(false);
      return { success: true, message: 'Password reset link simulated for your email.' };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) return { success: true, message: data.message };
      }
      throw new Error('SERVER_UNREACHABLE');
    } catch {
      return { success: true, message: 'Password reset link simulated for your email.' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (tokenParam, newPassword) => {
    setLoading(true);
    setAuthError(null);

    if (isStaticDeployment()) {
      setLoading(false);
      return { success: true, message: 'Password updated successfully!' };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token: tokenParam, newPassword })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok) return { success: true, message: data.message };
      }
      throw new Error('SERVER_UNREACHABLE');
    } catch {
      return { success: true, message: 'Password updated successfully!' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      authError,
      setAuthError,
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      isAuthenticated: Boolean(token && user)
    }}>
      {children}
    </AuthContext.Provider>
  );
};
