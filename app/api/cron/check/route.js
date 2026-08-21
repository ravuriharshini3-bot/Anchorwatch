import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getDnsSnapshot, diffDnsSnapshots } from "@/lib/dns";
import { getSslExpiry } from "@/lib/ssl";
import { getWhoisExpiry } from "@/lib/whois";
import { sendAlertEmail, sendDigestEmail } from "@/lib/email";
import { sendSlackAlert, sendDiscordAlert } from "@/lib/webhooks";

// Warn at these thresholds. A domain only gets one alert per threshold
// crossing, tracked via last_alert_sent_at, so people aren't emailed daily
// once something is already flagged.
const EXPIRY_THRESHOLDS = [60, 30, 14, 3];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: domains, error } = await supabase.from("domains").select("*");
  const { data: allProfiles } = await supabase.from("profiles").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profileById = new Map((allProfiles || []).map((p) => [p.id, p]));
  const results = [];

  for (const domain of domains || []) {
    try {
      const profile = profileById.get(domain.user_id);
      const [whois, sslExpiry, dnsSnapshot] = await Promise.all([
        getWhoisExpiry(domain.domain_name),
        getSslExpiry(domain.domain_name),
        getDnsSnapshot(domain.domain_name),
      ]);

      const dnsChanges = diffDnsSnapshots(domain.dns_snapshot, dnsSnapshot);
      const newDomainExpiry = whois.expiryDate ? whois.expiryDate.toISOString().slice(0, 10) : domain.domain_expiry_date;
      const newSslExpiry = sslExpiry ? sslExpiry.toISOString().slice(0, 10) : domain.ssl_expiry_date;

      const alerts = [];
      let newThresholdAlerted = domain.last_expiry_threshold_alerted ?? 999;

      // Domain expiry threshold crossed - only alert once per threshold,
      // tracked in last_expiry_threshold_alerted so this doesn't repeat daily.
      const domainDays = daysUntil(newDomainExpiry);
      if (domainDays !== null) {
        for (const threshold of EXPIRY_THRESHOLDS) {
          if (domainDays <= threshold && newThresholdAlerted > threshold) {
            alerts.push(`${domain.domain_name} expires in ${domainDays} days. Renew it soon to avoid losing it.`);
            newThresholdAlerted = threshold;
            break;
          }
        }
      }

      // SSL expiry threshold crossed
      const sslDays = daysUntil(newSslExpiry);
      if (sslDays !== null && sslDays <= 14 && sslDays >= 0) {
        alerts.push(`${domain.domain_name}'s SSL certificate expires in ${sslDays} days.`);
      }

      // DNS drift - only on real plans, since it's a Pro+ feature
      if (dnsChanges.length > 0 && profile?.plan !== "free") {
        const summary = dnsChanges.map((c) => `${c.record} record changed`).join(", ");
        alerts.push(`${domain.domain_name}'s DNS changed: ${summary}. If this wasn't you, check it now.`);
      }

      if (alerts.length > 0 && profile) {
        const message = alerts.join(" ");
        await sendAlertEmail({
          to: profile.email,
          subject: `AnchorWatch alert: ${domain.domain_name}`,
          message,
        });
        if (profile.plan !== "free") {
          await sendSlackAlert(profile.slack_webhook_url, `⚓ *AnchorWatch alert* — ${message}`);
          await sendDiscordAlert(profile.discord_webhook_url, `⚓ **AnchorWatch alert** — ${message}`);
        }
        await supabase.from("alerts_log").insert({
          domain_id: domain.id,
          user_id: domain.user_id,
          alert_type: "expiry_or_drift",
          message,
        });
      }

      await supabase
        .from("domains")
        .update({
          registrar: whois.registrar || domain.registrar,
          domain_expiry_date: newDomainExpiry,
          ssl_expiry_date: newSslExpiry,
          dns_snapshot: dnsSnapshot,
          status: whois.verified || domain.domain_expiry_date ? "ok" : "unverified",
          last_checked_at: new Date().toISOString(),
          last_error: whois.verified ? null : domain.last_error,
          last_expiry_threshold_alerted: newThresholdAlerted,
        })
        .eq("id", domain.id);

      results.push({ domain: domain.domain_name, ok: true, alerts: alerts.length });
    } catch (err) {
      results.push({ domain: domain.domain_name, ok: false, error: err.message });
    }
  }

  // Weekly digest - only send on Mondays (UTC) so it doesn't duplicate
  // the real-time alerts above.
  if (new Date().getUTCDay() === 1) {
    await sendWeeklyDigests(supabase);
  }

  return NextResponse.json({ checked: results.length, results });
}

async function sendWeeklyDigests(supabase) {
  const { data: profiles } = await supabase.from("profiles").select("*");
  for (const profile of profiles || []) {
    const { data: domains } = await supabase
      .from("domains")
      .select("domain_name, domain_expiry_date, ssl_expiry_date, status")
      .eq("user_id", profile.id);

    if (!domains || domains.length === 0) continue;

    const rows = domains
      .map((d) => {
        const dDays = daysUntil(d.domain_expiry_date);
        const sDays = daysUntil(d.ssl_expiry_date);
        return `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${d.domain_name}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${dDays !== null ? dDays + "d" : "—"}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;">${sDays !== null ? sDays + "d" : "—"}</td>
        </tr>`;
      })
      .join("");

    const summaryHtml = `
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 10px;">Domain</th>
            <th style="text-align:left;padding:6px 10px;">Domain expiry</th>
            <th style="text-align:left;padding:6px 10px;">SSL expiry</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    await sendDigestEmail({ to: profile.email, summaryHtml });
  }
}
