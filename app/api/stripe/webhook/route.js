import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature invalid: ${err.message}` }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id;
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            plan: "pro",
            stripe_subscription_id: session.subscription,
          })
          .eq("id", userId);
      }
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      await supabase
        .from("profiles")
        .update({ plan: isActive ? "pro" : "free" })
        .eq("stripe_customer_id", subscription.customer);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
