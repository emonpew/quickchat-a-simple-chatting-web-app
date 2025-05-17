"use client";
import { useEffect, useState } from "react";
import { ApiService } from "../../../services/api.service";
import { useRouter } from "next/navigation";

interface User {
  id: number; // Changed from Number to number (primitive type)
  username: string;
}

export default function UsersPage() {
  // Renamed from 'page' to more descriptive 'UsersPage'
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data: User[] = await ApiService.get("/user");
        setUsers(data || []);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = (userId: number) => {
    // Add your logic for adding a user here
    // console.log("Adding user with ID:", userId);

    ApiService.post("/chatroom", { recieverId: userId })
      .then(() => router.push("/chat"))
      .catch((error) => console.log(error));
  };

  if (isLoading) {
    return (
      <div className="custom_container">
        <div className="flex justify-center items-center h-64">
          <span className="text-xl">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="custom_container">
        <div className="flex justify-center items-center h-64">
          <span className="text-xl text-red-500">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="custom_container">
      <h1 className="text-2xl font-bold mb-6">Users List</h1>
      <div className="flex flex-col gap-4">
        {" "}
        {/* Changed mt-2 to gap for consistent spacing */}
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id} // Added key prop for React's reconciliation
              className="flex items-center justify-between p-4  rounded-lg shadow-sm"
            >
              <span className="text-xl font-medium">{user.username}</span>
              <button
                onClick={() => handleAddUser(user.id)}
                className="btn btn-primary px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No users found</div>
        )}
      </div>
    </div>
  );
}
