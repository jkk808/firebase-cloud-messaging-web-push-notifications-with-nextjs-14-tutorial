"use client";

import { Button } from "@/components/ui/button";
import useFcmToken from "@/hooks/useFcmToken";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { token, notificationPermissionStatus, manualRequestNotification } = useFcmToken();

  if (!mounted) return null; // Prevents hydration mismatch
  
  // if (!isStandalonePWA) return <p>Add this app to your Home Screen to enable push.</p>;

  const handleTestNotification = async () => {
    console.log("token: ", token);
    const response = await fetch("/send-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        title: "Test Notification",
        message: "This is a test notification",
        link: "/contact",
      }),
    });

    const data = await response.json();
    console.log(data);
  };

  return (
    <main className="p-10">
      <h1 className="text-4xl mb-4 font-bold">Firebase Cloud Messaging Demo</h1>


      {notificationPermissionStatus === "granted" ? (
        <p>Permission to receive notifications has been granted.</p>
      ) : notificationPermissionStatus !== null ? (
        <>      
          <p>
            You have not granted permission to receive notifications. Please
            enable notifications in your browser settings.
          </p>
          <br />        
          <Button onClick={async () => manualRequestNotification()}>
            Enable Notifications
          </Button>      
        </>
      ) : null}

      <Button
        disabled={!token}
        className="mt-5"
        onClick={handleTestNotification}
      >
        Send Test Notification
      </Button>

      <div>
        {token}
      </div>
    </main>
  );
}

