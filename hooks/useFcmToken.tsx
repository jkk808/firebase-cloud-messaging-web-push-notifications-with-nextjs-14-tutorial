// useFcmToken.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onMessage, Unsubscribe, isSupported, getMessaging, getToken } from "firebase/messaging";
import { messaging as getMessagingInstance, fetchToken } from "@/firebase";
import { toast } from "sonner"; // Add this import for toast notifications

function isStandalonePWA() {
  // iOS: navigator.standalone; cross-platform: display-mode media query
  return (typeof window !== "undefined") && (
    (window.matchMedia?.("(display-mode: standalone)")?.matches ?? false) ||
    // @ts-ignore - iOS only
    !!window.navigator.standalone
  );
}

export default function useFcmToken() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);

  const requestPermissionAndToken = useCallback(async () => {
    // if (!(await isSupported())) return null;
    // if (!isStandalonePWA()) return null; // guard: iOS only prompts in Home-Screen apps
    console.log("Requesting permission and token...");

    // MUST be called from a user gesture (e.g., onClick)
    const p = await Notification.requestPermission();
    setPermission(p);
    if (p !== "granted") return null;

    const t = await fetchToken(); // your wrapper around getToken(messaging, { vapidKey })
    console.log("Token: ", t);
    if (!t && retryLoadToken.current < 3) {
      retryLoadToken.current += 1;
      return await requestPermissionAndToken();
    }
    if (t) setToken(t);
    return t;
  }, []);

  // DON’T call Notification.requestPermission() here.
  useEffect(() => {
    (async () => {
      if (!(await isSupported())) return;
      // Optional: if already granted (from a previous session), fetch token silently
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        const t = await fetchToken();
        if (t) setToken(t);
        setPermission("granted");
      } else {
        setPermission(typeof Notification !== "undefined" ? Notification.permission : null);
      }
    })();
  }, []);

  // Foreground listener once we have a token
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    (async () => {
      if (!token) return;
      const m = await getMessagingInstance();
      if (!m) return;
      unsubscribe = onMessage(m, (payload) => {
        // Show a toast instead of a browser notification
        toast(payload?.notification?.title ?? "Notification", {
          description: payload?.notification?.body ?? "",
          action: {
            label: "Open",
            onClick: () => {
              if (payload?.data?.link) {
                window.location.href = payload.data.link;
              }
            },
          },
        });
      });
    })();
    return () => unsubscribe?.();
  }, [token]);

  return { token, permission, requestPermissionAndToken, isStandalonePWA: isStandalonePWA() };
}
