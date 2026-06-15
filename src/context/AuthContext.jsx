import React, { createContext, useCallback, useContext } from 'react';
import { authClient } from '../lib/auth-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const login = useCallback(async (email, password) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await authClient.signIn.social({ provider: 'google', callbackURL: '/app' });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: isPending, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
