"use client";

import { useEffect, useRef } from "react";
import { getEcho, disconnectEcho } from "../lib/echo-client";
import { useAuthStore } from "../store/auth-store";
import { useRealtimeStore } from "../store/realtime-store";
import { useQueryClient } from "@tanstack/react-query";

const EVENT_NAME = "ActivityLogged";

function teardown(subscriptionsRef, token) {
  subscriptionsRef.current.forEach(({ channel, handler }) => {
    channel.stopListening(`.${EVENT_NAME}`, handler);
    channel.unsubscribe();
  });
  subscriptionsRef.current = [];

  if (!token) {
    disconnectEcho();
  }
}

export function RealtimeListener() {
  const { token, user } = useAuthStore();
  const addEvent = useRealtimeStore((state) => state.addEvent);
  const echoRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token || !user) {
      teardown(subscriptionsRef, token);
      return;
    }

    const echo = getEcho(token);
    echoRef.current = echo;

    const channels = [];
    channels.push(echo.private(`users.${user.id}`));

    if (user.team_id) {
      channels.push(echo.private(`teams.${user.team_id}`));
    }

    const handler = (payload) => {
      addEvent(payload);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "reports"] });

      if (payload?.lead?.id) {
        queryClient.invalidateQueries({ queryKey: ["lead", payload.lead.id] });
      }
    };

    channels.forEach((channel) => {
      channel.listen(`.${EVENT_NAME}`, handler);
    });

    subscriptionsRef.current = channels.map((channel) => ({ channel, handler }));

    return () => {
      teardown(subscriptionsRef, token);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id, user?.team_id]);

  return null;
}

