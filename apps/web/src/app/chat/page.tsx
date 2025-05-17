"use client";
import Link from "next/link";
import { useWebSocket } from "../../contexts/WebSocketContext";

export default function page() {
  const { rooms, isConnected, error } = useWebSocket();

  console.log(isConnected);
  console.log(error);

  return (
    <div className="custom_container">
      <div className="flex flex-col">
        {rooms.map((val, idx) => (
          <div key={idx}>
            <div className="text-xl">{val.username}</div>
            <div className="text-sm">{val.lastmsg}</div>
            <div className="divider"></div>
          </div>
        ))}
      </div>
      <Link className="btn btn-primary" href="/chat/add">
        add friend
      </Link>
    </div>
  );
}
