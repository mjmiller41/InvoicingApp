import React, { createContext, useContext } from 'react';
import { authClient } from '../lib/auth-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  async function login(email, password) {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message);
  }

  async function register(name, email, password) {
    const { error } = await authClient.signUp.email({ name, email, password });
    if (error) throw new Error(error.message);
  }

  async function loginWithGoogle() {
    await authClient.signIn.social({ provider: 'google', callbackURL: '/app' });
  }

  async function logout() {
    await authClient.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, loading: isPending, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
