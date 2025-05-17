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
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(username, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="custom_container flex flex-col justify-center items-center h-screen">
      <div className="card bg-base-100 w-96 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Login to get started</h2>
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
            <Link href={"#"} className="text-sm text-primary">
              forgot password?
            </Link>
            <div className="h-1"></div>
            <div className="card-actions justify-center">
              <button className="btn btn-primary btn-wide" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          <div className="divider"></div>
          <h2 className="text-sm">
            Don't have an account?
            <span className="text-primary">
              <Link href={"/register"}> register</Link>
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
}
