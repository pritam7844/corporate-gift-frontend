import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdminAPI, loginEmployeeAPI } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Bring in the global action from Zustand
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleAdminLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginAdminAPI(email, password);
      setAuth(data.accessToken, data.refreshToken, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeLogin = async (email, password, subdomain) => {
    setError('');
    setLoading(true);
    try {
      const data = await loginEmployeeAPI(email, password, subdomain);
      setAuth(data.accessToken, data.refreshToken, data.user);
      // Use hard navigation so the browser stays in the correct subdomain context.
      // router.push('/') can misroute on subdomain-based Next.js middleware setups.
      window.location.href = '/';
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleAdminLogin, handleEmployeeLogin, error, loading };
};