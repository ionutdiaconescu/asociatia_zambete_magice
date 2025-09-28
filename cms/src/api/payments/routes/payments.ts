export default {
  routes: [
    {
      method: "POST",
      path: "/payments/create-checkout-session",
      handler: "payments.createCheckoutSession",
      config: {
        auth: false, // public endpoint (you can secure later with API token)
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/stripe/webhook",
      handler: "payments.webhook",
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
