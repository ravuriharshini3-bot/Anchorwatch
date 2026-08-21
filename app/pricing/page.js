import Link from "next/link";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    cta: "Start free",
    features: [
      "3 domains tracked",
      "Daily checks",
      "Domain + SSL expiry alerts",
      "Email alerts",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    highlight: true,
    cta: "Start free trial",
    features: [
      "25 domains tracked",
      "Hourly checks",
      "Domain + SSL expiry alerts",
      "DNS drift detection",
      "Email, Slack, Discord alerts",
    ],
  },
  {
    name: "Agency",
    price: "$29",
    period: "/mo",
    cta: "Start free trial",
    features: [
      "Unlimited domains",
      "Hourly checks",
      "Everything in Pro",
      "Client grouping & reports",
      "5 team seats",
      "API access",
    ],
  },
];

export default function PricingPage() {
  return (
    <main style={{ padding: "4rem 0" }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 30, marginBottom: 10 }}>Simple pricing</h1>
          <p style={{ color: "var(--ink-soft)" }}>Start free. Upgrade the moment you need more domains or DNS drift alerts.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="card"
              style={{
                padding: "1.75rem",
                border: tier.highlight ? "2px solid var(--teal)" : "1px solid var(--border)",
              }}
            >
              {tier.highlight && (
                <span className="badge badge-ok" style={{ marginBottom: 10 }}>Most popular</span>
              )}
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>{tier.name}</h2>
              <p style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 32, fontFamily: "Sora, sans-serif", fontWeight: 600 }}>{tier.price}</span>
                <span style={{ color: "var(--ink-soft)" }}>{tier.period}</span>
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: "var(--ink-soft)" }}>✓ {f}</li>
                ))}
              </ul>
              <Link
                href="/login"
                className={tier.highlight ? "btn btn-primary" : "btn btn-ghost"}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 13, marginTop: 30 }}>
          Annual billing saves ~22%. Cancel anytime from your dashboard.
        </p>
      </div>
    </main>
  );
}
