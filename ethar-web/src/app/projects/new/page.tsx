"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/AppLayout";
import styles from "../../dashboard.module.css";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setLoading(true);
    const token = (session.user as any).backendToken;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      if (res.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Removed ADMIN check so any user can create a project.

  return (
    <AppLayout>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/projects" style={{ color: "var(--text-muted)" }}>
            ← Back
          </Link>
          <h1>Create New Project</h1>
        </div>
      </header>

      <div
        className="glass fade-in"
        style={{ padding: "2rem", borderRadius: "12px", marginTop: "2rem", maxWidth: "600px" }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div>
            <label className="label">Project Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="E.g. Website Redesign"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What is this project about?"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
