import Link from "next/link";

function Nav() {
  return (
    <div style={{ borderBottom: "1px solid var(--border)", background: "#fff" }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px" }}>
        <span className="heading" style={{ fontSize: 19 }}>⚓ AnchorWatch</span>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <Link href="/pricing" style={{ color: "var(--ink)", fontSize: 14.5, fontWeight: 500 }}>Pricing</Link>
          <Link href="/login" style={{ color: "var(--ink)", fontSize: 14.5, fontWeight: 500 }}>Log in</Link>
          <Link href="/login" className="btn btn-dark">Start watching free</Link>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main>
      <Nav />

      {/* Hero */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "5rem 0 4.5rem" }}>
        <div className="container" style={{ maxWidth: 720, textAlign: "center" }}>
          <h1 style={{ fontSize: 42, lineHeight: 1.15, marginBottom: 18 }}>
            Never lose a domain to a forgotten renewal.
          </h1>
          <p style={{ fontSize: 17, color: "#B9C6CE", marginBottom: 30 }}>
            AnchorWatch watches every domain, SSL certificate, and DNS record you own —
            and tells you the moment something&rsquo;s about to break.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: 15, padding: "13px 26px" }}>
            Start watching free — no credit card
          </Link>
          <p style={{ fontSize: 13, color: "#7E93A0", marginTop: 24, letterSpacing: "0.03em" }}>
            DOMAIN EXPIRY ALERTS &nbsp;·&nbsp; SSL MONITORING &nbsp;·&nbsp; DNS DRIFT DETECTION &nbsp;·&nbsp; SLACK &amp; DISCORD
          </p>
        </div>
      </section>

      {/* The 2am problem */}
      <section style={{ padding: "4.5rem 0" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <p style={{ color: "var(--teal-dark)", fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", marginBottom: 10 }}>
            THE 2AM PROBLEM
          </p>
          <h2 style={{ fontSize: 26, marginBottom: 14 }}>Domains don&rsquo;t expire on a convenient schedule.</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 15.5 }}>
            Registrar emails get buried, auto-renew fails silently on an old card, and one day the
            domain that runs your business is up for grabs. AnchorWatch checks every domain you add,
            every day, so the renewal date is never a surprise.
          </p>
        </div>
      </section>

      {/* Not just expiry */}
      <section style={{ padding: "0 0 4.5rem" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <p style={{ color: "var(--teal-dark)", fontWeight: 600, fontSize: 13, letterSpacing: "0.08em", marginBottom: 10 }}>
            IT&rsquo;S NOT JUST EXPIRY
          </p>
          <h2 style={{ fontSize: 26, marginBottom: 14 }}>Your DNS can change without anyone touching it on purpose.</h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 15.5 }}>
            A provider migration, a misconfigured integration, or something worse. AnchorWatch keeps a
            snapshot of your DNS and flags anything that shifts, so you find out from us — not from a
            customer.
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
            {[
              ["Domain expiry alerts", "60/30/14/3-day warnings before a domain lapses."],
              ["SSL certificate monitoring", "Know before a cert expires and takes your site down."],
              ["DNS drift detection", "A snapshot of your records, with alerts on any change."],
              ["Slack & Discord alerts", "Route warnings straight to the channel your team watches."],
            ].map(([title, body]) => (
              <div key={title}>
                <h3 style={{ fontSize: 16, marginBottom: 6 }}>{title}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: 14.5, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ padding: "4.5rem 0", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: 24, marginBottom: 10 }}>Free for up to 3 domains, forever.</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 22 }}>Upgrade when you need more.</p>
          <Link href="/pricing" className="btn btn-ghost">See pricing</Link>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: "var(--navy)", color: "#fff", padding: "4rem 0", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontSize: 24, marginBottom: 10, color: "#fff" }}>
            Set it up in two minutes. Forget about it until it matters.
          </h2>
          <Link href="/login" className="btn btn-primary" style={{ marginTop: 12 }}>
            Start watching free
          </Link>
        </div>
      </section>

      <footer style={{ padding: "24px 0", textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>
        © {new Date().getFullYear()} AnchorWatch
      </footer>
    </main>
  );
}
