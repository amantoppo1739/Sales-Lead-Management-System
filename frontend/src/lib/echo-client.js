"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance = null;
let lastToken = null;

Pusher.Runtime.createStreamingSocket = null;

function resolveApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
  try {
    const parsed = new URL(url);
    if (parsed.pathname.endsWith("/api") || parsed.pathname.endsWith("/api/")) {
      parsed.pathname = parsed.pathname.replace(/\/api\/?$/, "");
    } else if (parsed.pathname.includes("/api/")) {
      parsed.pathname = parsed.pathname.split("/api/")[0];
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:8000";
  }
}

export function getEcho(token) {
  if (typeof window === "undefined") {
    return null;
  }

  if (!token) {
    return null;
  }

  if (echoInstance && lastToken === token) {
    return echoInstance;
  }

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  const apiBaseUrl = resolveApiBaseUrl();
  window.Pusher = Pusher;

  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "mt1";
  const host =
    process.env.NEXT_PUBLIC_PUSHER_HOST ??
    (typeof window !== "undefined" ? window.location.hostname : undefined);
  const wsPort = Number(process.env.NEXT_PUBLIC_PUSHER_PORT ?? 6001);
  const useTLS = String(process.env.NEXT_PUBLIC_PUSHER_TLS ?? "false").toLowerCase() === "true";

  const echoOptions = {
    broadcaster: "pusher",
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY ?? "local",
    cluster,
    forceTLS: useTLS,
    disableStats: true,
    authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        token,
      },
    },
  };

  if (host) {
    echoOptions.wsHost = host;
    echoOptions.wssHost = host;
    echoOptions.wsPort = wsPort;
    echoOptions.wssPort = Number(process.env.NEXT_PUBLIC_PUSHER_TLS_PORT ?? wsPort);
    echoOptions.forceTLS = useTLS;
    echoOptions.enabledTransports = useTLS ? ["wss"] : ["ws", "wss"];
  }

  echoInstance = new Echo(echoOptions);

  lastToken = token;
  return echoInstance;
}

export function disconnectEcho() {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    lastToken = null;
  }
}

