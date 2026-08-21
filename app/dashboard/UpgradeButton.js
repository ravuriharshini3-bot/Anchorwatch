"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
      alert(data.error || "Something went wrong. Try again.");
    }
  };

  return (
    <button onClick={handleClick} className="btn btn-primary" disabled={loading}>
      {loading ? "Redirecting…" : "Upgrade to Pro — $9/mo"}
    </button>
  );
}
