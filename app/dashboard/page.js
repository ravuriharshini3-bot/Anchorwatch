import { createClient } from "@/lib/supabase/server";
import { addDomain, deleteDomain, saveWebhooks, signOut } from "./actions";
import UpgradeButton from "./UpgradeButton";
import Link from "next/link";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusBadge({ domain }) {
  if (domain.status === "pending") {
    return <span className="badge badge-pending">Checking…</span>;
  }
  const domainDays = daysUntil(domain.domain_expiry_date);
  const sslDays = daysUntil(domain.ssl_expiry_date);
  const soonest = [domainDays, sslDays].filter((d) => d !== null).sort((a, b) => a - b)[0];

  if (soonest !== undefined && soonest <= 14) {
    return <span className="badge badge-danger">⚠ Expires in {soonest}d</span>;
  }
  if (soonest !== undefined && soonest <= 30) {
    return <span className="badge badge-warn">Expires in {soonest}d</span>;
  }
  if (domain.status === "unverified") {
    return <span className="badge badge-pending">Check manually</span>;
  }
  return <span className="badge badge-ok">Healthy</span>;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: domains } = await supabase
    .from("domains")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const domainList = domains || [];
  const limit = profile?.plan === "agency" ? Infinity : profile?.plan === "pro" ? 25 : 3;

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border)", background: "#fff" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
          <span className="heading" style={{ fontSize: 18 }}>⚓ AnchorWatch</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{user.email}</span>
            <span className="badge badge-ok" style={{ textTransform: "capitalize" }}>{profile?.plan || "free"} plan</span>
            <form action={signOut}>
              <button className="btn btn-ghost" type="submit" style={{ padding: "6px 14px", fontSize: 13 }}>Sign out</button>
            </form>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 24px", maxWidth: 860 }}>
        {/* Add domain */}
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Add a domain</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 14 }}>
            {domainList.length}/{limit === Infinity ? "∞" : limit} domains used
          </p>
          <form
            action={async (formData) => {
              "use server";
              await addDomain(formData);
            }}
            style={{ display: "flex", gap: 10 }}
          >
            <input type="text" name="domain" placeholder="example.com" required />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>Add domain</button>
          </form>
        </div>

        {/* Domain list */}
        <div className="card" style={{ marginBottom: "1.75rem" }}>
          {domainList.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--ink-soft)", fontSize: 14.5 }}>
              No domains yet. Add your first one above.
            </p>
          ) : (
            domainList.map((d, i) => {
              const domainDays = daysUntil(d.domain_expiry_date);
              const sslDays = daysUntil(d.ssl_expiry_date);
              return (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderBottom: i < domainList.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{d.domain_name}</p>
                    <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                      {d.registrar ? `${d.registrar} · ` : ""}
                      Domain expires: {domainDays !== null ? `${domainDays}d` : "unknown"}
                      {" · "}
                      SSL expires: {sslDays !== null ? `${sslDays}d` : "no HTTPS detected"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <StatusBadge domain={d} />
                    <form
                      action={async (formData) => {
                        "use server";
                        await deleteDomain(formData);
                      }}
                    >
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 13 }}
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alert settings */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: 16, marginBottom: 4 }}>Alert channels</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 14 }}>
            Email alerts are always on. Add Slack or Discord webhook URLs to also post there.
            {profile?.plan === "free" && " (Upgrade to Pro to enable these.)"}
          </p>
          <form
            action={async (formData) => {
              "use server";
              await saveWebhooks(formData);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <input
              type="url"
              name="slack"
              placeholder="Slack webhook URL"
              defaultValue={profile?.slack_webhook_url || ""}
              disabled={profile?.plan === "free"}
            />
            <input
              type="url"
              name="discord"
              placeholder="Discord webhook URL"
              defaultValue={profile?.discord_webhook_url || ""}
              disabled={profile?.plan === "free"}
            />
            <button type="submit" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} disabled={profile?.plan === "free"}>
              Save alert settings
            </button>
          </form>
        </div>

        {profile?.plan === "free" && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 12 }}>
              Need more domains or DNS drift alerts?
            </p>
            <UpgradeButton />
          </div>
        )}
      </div>
    </main>
  );
}
