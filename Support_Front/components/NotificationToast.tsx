"use client";
import { useEffect, useState } from "react";
import { useNotification } from "@/context/NotificationContext";

export default function NotificationToast() {
  const { notifications } = useNotification();
  const [latest, setLatest] = useState<any>(null);

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].read) {
      setLatest(notifications[0]);
      const timer = setTimeout(() => setLatest(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!latest) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
      <div className="font-semibold">{latest.title}</div>
      <div className="text-sm">{latest.body}</div>
    </div>
  );
}
