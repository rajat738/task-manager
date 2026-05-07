import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import styles from "./dashboard.module.css";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";

async function fetchDashboardData(token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const tasksRes = await fetch(`${apiUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const tasks = tasksRes.ok ? await tasksRes.json() : [];
    return { tasks };
  } catch (err) {
    console.error(err);
    return { tasks: [] };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const token = (session.user as any).backendToken;
  const { tasks } = await fetchDashboardData(token);

  const now = new Date();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter(
    (t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
  );

  return (
    <AppLayout>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerActions}>
          <Link href="/tasks/new" className="btn-primary">
            + New Task
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass fade-in`}>
          <h3>Total Tasks</h3>
          <div className={styles.statValue}>{totalTasks}</div>
        </div>
        <div className={`${styles.statCard} glass fade-in`} style={{ animationDelay: "0.1s" }}>
          <h3>In Progress</h3>
          <div className={styles.statValue}>{inProgressTasks}</div>
        </div>
        <div className={`${styles.statCard} glass fade-in`} style={{ animationDelay: "0.2s" }}>
          <h3>Completed</h3>
          <div className={styles.statValue}>{completedTasks}</div>
        </div>
        <div
          className={`${styles.statCard} glass fade-in`}
          style={{
            animationDelay: "0.3s",
            borderColor: overdueTasks.length > 0 ? "rgba(239,68,68,0.4)" : undefined,
          }}
        >
          <h3 style={{ color: overdueTasks.length > 0 ? "var(--danger)" : undefined }}>
            ⚠ Overdue
          </h3>
          <div
            className={styles.statValue}
            style={{ color: overdueTasks.length > 0 ? "var(--danger)" : undefined }}
          >
            {overdueTasks.length}
          </div>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div
          className="glass fade-in"
          style={{
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.05)",
          }}
        >
          <h2 style={{ fontSize: "1rem", color: "var(--danger)", marginBottom: "1rem" }}>
            ⚠ Overdue Tasks
          </h2>
          <div className={styles.taskList}>
            {overdueTasks.map((task: any) => (
              <div
                key={task.id}
                className={styles.taskItem}
                style={{ borderColor: "rgba(239,68,68,0.3)" }}
              >
                <div className={styles.taskInfo}>
                  <h4>{task.title}</h4>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--danger)" }}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className={`status-${task.status?.toLowerCase().replace("_", "") || "todo"}`}>
                      {task.status?.replace("_", " ") || "TODO"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`${styles.recentSection} glass fade-in`}
        style={{ animationDelay: "0.4s" }}
      >
        <div className={styles.sectionHeader}>
          <h2>Recent Tasks</h2>
          <Link href="/tasks" className={styles.viewAll}>
            View all →
          </Link>
        </div>

        {tasks.length > 0 ? (
          <div className={styles.taskList}>
            {tasks.slice(0, 5).map((task: any) => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskInfo}>
                  <div>
                    <h4>{task.title}</h4>
                    {task.project && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {task.project.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {task.dueDate && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span
                      className={`status-${task.status?.toLowerCase().replace("_", "") || "todo"}`}
                    >
                      {task.status?.replace("_", " ") || "TODO"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>You have no tasks yet. Get started by creating one!</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
