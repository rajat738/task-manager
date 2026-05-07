"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // Safely parse — avoid crash if backend returns non-JSON
      let data: any = {};
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text || "Something went wrong" };
      }

      if (!res.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Redirect to login with a success message
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} fade-in`}>
        {/* Logo */}
        <div className={styles.logoMark}>
          <div className={styles.logoIcon} />
          <span className={styles.logoText}>Ethar.ai</span>
        </div>

        <div>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Get started with Ethar.ai today</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className="label" htmlFor="name">
              Full Name
            </label>
            <input
              className="input"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className="label" htmlFor="email">
              Email address
            </label>
            <input
              className="input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              className="input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account?
          <Link href="/login" className={styles.link}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
