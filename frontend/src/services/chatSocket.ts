import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : window.location.origin);

let socket: Socket | null = null;
let activeUserId: string | null = null;

export function getChatSocket(userId: string): Socket {
  if (!socket || activeUserId !== userId) {
    if (socket) {
      socket.disconnect();
    }

    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      auth: { userId },
    });

    activeUserId = userId;
  }

  return socket;
}

export function closeChatSocket() {
  if (socket) {
    socket.disconnect();
  }
  socket = null;
  activeUserId = null;
}
