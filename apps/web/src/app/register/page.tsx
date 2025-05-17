"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useRouter } from "next/navigation";

export default function page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await register(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="custom_container flex flex-col justify-center items-center h-screen">
      <div className="card bg-base-100 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">register</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          {/* <div className="divider"></div> */}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="input"
              placeholder="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="h-2"></div>
            <input
              type="password"
              className="input"
              placeholder="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="h-2"></div>
            <div className="card-actions justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-success btn-wide "
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
          <div className="divider"></div>
          <h2 className="text-sm">
            already have an account?
            <span className="text-primary">
              <Link href={"/login"}> login</Link>
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
}
