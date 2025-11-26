"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/auth-store";
import { fetchCurrentUser } from "../lib/api-client";

export function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    let isMounted = true;

    fetchCurrentUser()
      .then((response) => {
        if (isMounted) {
          setAuth({ token, user: response.data });
        }
      })
      .catch(() => {
        useAuthStore.getState().clearAuth();
      });

    return () => {
      isMounted = false;
    };
  }, [token, user, setAuth]);

  return null;
}

