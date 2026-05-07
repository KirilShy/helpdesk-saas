import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hd_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hd_user')); } catch { return null; }
  });

  const login = (tok, usr) => {
    localStorage.setItem('hd_token', tok);
    localStorage.setItem('hd_user', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem('hd_token');
    localStorage.removeItem('hd_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
