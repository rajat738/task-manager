"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/AppLayout";
import styles from "../../dashboard.module.css";
import Link from "next/link";

export default function NewTaskPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const token = (session.user as any).backendToken;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      fetch(`${apiUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setProjects(data as any);
            if (data.length > 0) setProjectId(data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setLoading(true);
    const token = (session.user as any).backendToken;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          projectId,
          assigneeId: (session.user as any).id,
        }),
      });

      if (res.ok) {
        router.push("/tasks");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create task");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <header className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/tasks" style={{ color: "var(--text-muted)" }}>
            ← Back
          </Link>
          <h1>Create New Task</h1>
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
            <label className="label">Task Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="E.g. Update user dashboard"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detailed explanation of the task..."
            />
          </div>

          <div>
            <label className="label">Project</label>
            <select
              className="input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {projects.length === 0 ? (
                <option value="">No projects available</option>
              ) : (
                projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !projectId}>
            {loading ? "Creating..." : "Create Task"}
          </button>

          {!projectId && projects.length === 0 && (
            <p style={{ color: "var(--danger)", fontSize: "0.8rem", textAlign: "center" }}>
              You need to create a Project first before adding a task.
              <br />
              <Link href="/projects/new" style={{ color: "var(--primary)", textDecoration: "underline" }}>Create a Project</Link>
            </p>
          )}
        </form>
      </div>
    </AppLayout>
  );
}
