// src/components/PackForm/hooks/usePackFormAuth.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../../api/auth';

export const usePackFormAuth = (mode: 'upload' | 'edit', packId?: string) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const authenticated = await checkAuth();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          sessionStorage.setItem('redirectAfterLogin', mode === 'upload' ? '/upload-pack' : `/edit-pack/${packId}`);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, [navigate, mode, packId]);

  return { isAuthenticated, isCheckingAuth };
};