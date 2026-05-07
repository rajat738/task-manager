import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import styles from "../dashboard.module.css";
import Link from "next/link";

async function fetchTasks(token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const token = (session.user as any).backendToken;
  const tasks = await fetchTasks(token);

  // Group tasks for Kanban board
  const columns = {
    TODO: tasks.filter((t: any) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t: any) => t.status === "IN_PROGRESS"),
    REVIEW: tasks.filter((t: any) => t.status === "REVIEW"),
    DONE: tasks.filter((t: any) => t.status === "DONE"),
  };

  return (
    <AppLayout>
      <header className={styles.header}>
        <h1>My Tasks</h1>
        <div className={styles.headerActions}>
          <Link href="/tasks/new" className="btn-primary">
            + New Task
          </Link>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginTop: "2rem",
          overflowX: "auto",
          paddingBottom: "1rem",
          minHeight: "60vh",
        }}
      >
        {Object.entries(columns).map(([status, statusTasks], index) => (
          <div
            key={status}
            style={{
              flex: "0 0 300px",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid var(--surface-border)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              animationDelay: `${index * 0.1}s`,
            }}
            className="fade-in"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-muted)" }}>
                {status.replace("_", " ")}
              </h3>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                }}
              >
                {(statusTasks as any[]).length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(statusTasks as any[]).map((task: any) => (
                <div
                  key={task.id}
                  style={{
                    background: "var(--surface)",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--surface-border)",
                    cursor: "pointer",
                    transition: "transform 0.2s, border-color 0.2s",
                  }}
                  className="task-card"
                >
                  <h4 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>{task.title}</h4>
                  {task.description && (
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: "1rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {task.description}
                    </p>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                    </span>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "white",
                      }}
                    >
                      {session.user?.name?.charAt(0)}
                    </div>
                  </div>
                </div>
              ))}

              {(statusTasks as any[]).length === 0 && (
                <div
                  style={{
                    padding: "2rem 1rem",
                    textAlign: "center",
                    border: "1px dashed var(--surface-border)",
                    borderRadius: "8px",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                  }}
                >
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .task-card:hover {
          border-color: rgba(99, 102, 241, 0.5) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </AppLayout>
  );
}
