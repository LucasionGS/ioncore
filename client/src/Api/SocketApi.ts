import { io } from "socket.io-client";
import BaseApi from "./BaseApi";

const socket = io();

namespace SocketApi {
  const subscriptions: Record<string, any> = {};
  /**
   * Subscribe to a Socket.io room.
   * @param roomId ID of the room to subscribe to.
   * @param callback Callback function to call when a message is received.
   * @returns A tuple containing a function to send messages to the room and a function to unsubscribe from the room.
   */
  export function subscribe<const T>(roomId: string, callback: (...data: T[]) => void) {
    const key = roomId;
    const existing = subscriptions[key];
    if (existing) socket.off(key, existing);
    socket.emit("subscribe", roomId, BaseApi.getToken());
    socket.on(key, callback);
    subscriptions[key] = callback;

    return [(...data: T[]) => sendMessage<T>(roomId, ...data), () => unsubscribe(roomId)] as const;
  }

  export function unsubscribe(roomId: string) {
    const key = roomId;
    const existing = subscriptions[key];
    socket.emit("unsubscribe", roomId);
    socket.off(key, existing);
  }

  export function sendMessage<const T>(roomId: string, ...data: T[]) {
    socket.emit(roomId, ...data);
  }
}

export default SocketApi;