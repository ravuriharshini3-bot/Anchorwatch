import { resolve4, resolveMx, resolveTxt, resolveNs } from "node:dns/promises";

// Looks up the core DNS records for a domain. Any record type that fails
// (e.g. no MX records configured) is recorded as an empty array rather
// than failing the whole check - a missing record is meaningful, not an error.
export async function getDnsSnapshot(domain) {
  const [a, mx, txt, ns] = await Promise.all([
    resolve4(domain).catch(() => []),
    resolveMx(domain).catch(() => []),
    resolveTxt(domain).catch(() => []),
    resolveNs(domain).catch(() => []),
  ]);

  return {
    a: a.sort(),
    mx: mx.map((m) => `${m.priority} ${m.exchange}`).sort(),
    txt: txt.map((t) => t.join("")).sort(),
    ns: ns.sort(),
    checked_at: new Date().toISOString(),
  };
}

// Compares two snapshots and returns a plain-English list of what changed.
// Ignores the checked_at timestamp - only real record changes count.
export function diffDnsSnapshots(previous, current) {
  if (!previous) return [];
  const changes = [];
  for (const key of ["a", "mx", "txt", "ns"]) {
    const before = JSON.stringify(previous[key] || []);
    const after = JSON.stringify(current[key] || []);
    if (before !== after) {
      changes.push({
        record: key.toUpperCase(),
        before: previous[key] || [],
        after: current[key] || [],
      });
    }
  }
  return changes;
}
