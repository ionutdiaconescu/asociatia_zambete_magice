const express = require("express");
const Stripe = require("stripe");
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
  const { amount, donorEmail, donorName, campaignId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "ron",
            product_data: {
              name: `Donatie pentru campania #${campaignId}`,
              description: donorName ? `Donator: ${donorName}` : undefined,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: donorEmail,
      mode: "payment",
      success_url: "https://asociatia-zambete-magice.ro/succes",
      cancel_url: "https://asociatia-zambete-magice.ro/anulare",
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
