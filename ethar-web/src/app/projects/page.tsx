import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import styles from "../dashboard.module.css";
import Link from "next/link";

async function fetchProjects(token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const res = await fetch(`${apiUrl}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return res.ok ? await res.json() : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const token = (session.user as any).backendToken;
  const projects = await fetchProjects(token);

  return (
    <AppLayout>
      <header className={styles.header}>
        <h1>Projects</h1>
        <div className={styles.headerActions}>
          <Link href="/projects/new" className="btn-primary">
            + New Project
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid} style={{ marginTop: "2rem" }}>
        {projects.length > 0 ? (
          projects.map((project: any, i: number) => (
            <div
              key={project.id}
              className={`${styles.statCard} glass fade-in`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <h3>{project.name}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                {project.description || "No description provided."}
              </p>
              <div
                style={{
                  marginTop: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--surface-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {project.tasks?.length || 0} tasks
                </span>
                <Link
                  href={`/projects/${project.id}`}
                  style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "500" }}
                >
                  View
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState} style={{ gridColumn: "1 / -1" }}>
            <p>
              No projects found. Create one to get started!
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
