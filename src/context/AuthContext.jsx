import { createContext, useContext, useState, useEffect } from 'react';
import { Container } from '../core/di/Container.js';
import { accessLogService } from '../utils/AccessLogService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // We resolve the AuthService here, assuming ServiceProvider.register() was already called in main.jsx
  const authService = Container.resolve('auth');

  useEffect(() => {
    // Note: initAuth is now handled automatically by AuthService constructor
    const sessionUser = authService.getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
    }
    setLoading(false);
  }, [authService]);

  const login = async (username, password) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
    await accessLogService.recordLogin(loggedInUser);
    return loggedInUser;
  };

  const loginWithPin = async (pin) => {
    const loggedInUser = await authService.loginWithPin(pin);
    setUser(loggedInUser);
    await accessLogService.recordLogin(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    accessLogService.recordLogout();
    authService.logout();
    setUser(null);
  };

  if (loading) return null; // or a spinner

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithPin,
        logout,
        getAvailableAccounts: () => authService.getAvailableAccounts(),
        isPinConfigured: () => authService.isPinConfigured(),
        getCurrentSessionUser: () => authService.getCurrentUser(),
        updateUserPassword: (username, newPass) => authService.updateUserPassword(username, newPass),
        updateUserProfile: (username, updates) => authService.updateUserProfile(username, updates),
        resetAllAccountsToDefaults: () => authService.resetAllAccountsToDefaults(),
        switchSessionToUser: (username) => {
          const newSession = authService.switchSessionToUser(username);
          setUser(newSession);
          return newSession;
        },
        hashPasswordBCrypt: (pass) => authService.hashPasswordBCrypt(pass),
        verifyPasswordBCrypt: (pass, hash) => authService.verifyPasswordBCrypt(pass, hash)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

