"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDnsSnapshot } from "@/lib/dns";
import { getSslExpiry } from "@/lib/ssl";
import { getWhoisExpiry } from "@/lib/whois";

function cleanDomain(raw) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

export async function addDomain(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const domainName = cleanDomain(formData.get("domain") || "");
  if (!domainName || !domainName.includes(".")) {
    return { error: "Enter a valid domain, like example.com." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("domains")
    .insert({ user_id: user.id, domain_name: domainName, status: "pending" })
    .select()
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  // Run the first check immediately so the user sees real data right away,
  // instead of waiting for the next scheduled cron run.
  try {
    const [whois, sslExpiry, dnsSnapshot] = await Promise.all([
      getWhoisExpiry(domainName),
      getSslExpiry(domainName),
      getDnsSnapshot(domainName),
    ]);

    await supabase
      .from("domains")
      .update({
        registrar: whois.registrar,
        domain_expiry_date: whois.expiryDate ? whois.expiryDate.toISOString().slice(0, 10) : null,
        ssl_expiry_date: sslExpiry ? sslExpiry.toISOString().slice(0, 10) : null,
        dns_snapshot: dnsSnapshot,
        status: whois.verified ? "ok" : "unverified",
        last_checked_at: new Date().toISOString(),
        last_error: whois.verified ? null : "Couldn't verify registration expiry automatically — check manually with your registrar.",
      })
      .eq("id", inserted.id);
  } catch (e) {
    // The domain is still saved even if the first check fails - the
    // nightly cron will retry it.
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDomain(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id");
  await supabase.from("domains").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard");
}

export async function saveWebhooks(formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const slack = (formData.get("slack") || "").trim() || null;
  const discord = (formData.get("discord") || "").trim() || null;

  await supabase
    .from("profiles")
    .update({ slack_webhook_url: slack, discord_webhook_url: discord })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
