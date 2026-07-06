import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

/** Joins a trip's socket room while mounted so this client receives real-time updates. */
export function useTripRoom(tripId: string | undefined) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !tripId) return;
    socket.emit("trip:join", tripId);
    return () => {
      socket.emit("trip:leave", tripId);
    };
  }, [socket, tripId]);
}
