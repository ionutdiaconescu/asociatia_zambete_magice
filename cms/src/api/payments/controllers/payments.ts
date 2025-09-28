import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const currency = (process.env.DONATION_CURRENCY || "RON").toLowerCase();

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeSecret) {
    throw new Error("Stripe secret key not configured");
  }
  if (!stripe) {
    stripe = new Stripe(stripeSecret, { apiVersion: "2025-08-27.basil" });
  }
  return stripe;
}

export default {
  async createCheckoutSession(ctx) {
    if (!stripeSecret) {
      ctx.throw(500, "Stripe secret key not configured");
    }
    const { amount, campaignId, donorEmail } = ctx.request.body || {};
    if (!amount || typeof amount !== "number" || amount <= 0) {
      ctx.throw(400, "Invalid amount");
    }
    if (!campaignId) {
      ctx.throw(400, "campaignId required");
    }
    const amountInMinor = Math.round(amount * 100);
    const successUrl = `${frontendUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/donate/cancel`;
    try {
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: amountInMinor,
              product_data: {
                name: "Donatie",
                metadata: { campaignId: String(campaignId) },
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          campaignId: String(campaignId),
          amountInMinor: String(amountInMinor),
        },
        customer_email: donorEmail || undefined,
      });
      ctx.body = { id: session.id, url: session.url };
    } catch (e) {
      strapi.log.error("Stripe session error", e);
      ctx.throw(500, "Stripe session creation failed");
    }
  },
  async webhook(ctx) {
    if (!webhookSecret) {
      ctx.throw(500, "Webhook secret not configured");
    }
    const sig = ctx.request.headers["stripe-signature"];
    if (!sig) {
      ctx.throw(400, "Missing stripe-signature header");
    }
    let event: Stripe.Event;
    try {
      const raw =
        (ctx.request as any).body?.[Symbol.for("unparsedBody")] ||
        (ctx.request as any).rawBody ||
        "";
      event = getStripe().webhooks.constructEvent(
        raw,
        sig as string,
        webhookSecret
      );
    } catch (err) {
      ctx.throw(
        400,
        `Webhook signature verification failed: ${(err as Error).message}`
      );
      return;
    }
    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentIntentId = session.payment_intent as string | undefined;
        const amountTotal = session.amount_total; // minor units
        const metadata = session.metadata || {};
        const campaignId = metadata.campaignId;
        const email = session.customer_details?.email;
        // Upsert donation by stripeSessionId
        const existing = await strapi.db
          .query("api::donatii.donatii")
          .findOne({ where: { stripeSessionId: session.id } });
        if (!existing) {
          await strapi.db.query("api::donatii.donatii").create({
            data: {
              stripeSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              amountInMinorUnit: amountTotal,
              emailDonator: email,
              stare: "completed",
              campanie_de_donatii: campaignId ? Number(campaignId) : undefined,
            },
          });
        } else {
          await strapi.db.query("api::donatii.donatii").update({
            where: { id: existing.id },
            data: {
              stripePaymentIntentId: paymentIntentId,
              amountInMinorUnit: amountTotal,
              emailDonator: existing.emailDonator || email,
              stare: "completed",
            },
          });
        }
        // Increment campaign raised if exists
        if (campaignId) {
          const campaign = await strapi.db
            .query("api::campanie-de-donatii.campanie-de-donatii")
            .findOne({
              where: { id: Number(campaignId) },
              select: ["id", "raised"],
            });
          if (campaign) {
            const current = (campaign as any).raised || 0;
            await strapi.db
              .query("api::campanie-de-donatii.campanie-de-donatii")
              .update({
                where: { id: campaign.id },
                data: { raised: current + (amountTotal || 0) / 100 },
              });
          }
        }
      }
    } catch (err) {
      strapi.log.error("Webhook processing error", err);
      ctx.throw(500, "Webhook processing failed");
      return;
    }
    ctx.body = { received: true };
  },
};
