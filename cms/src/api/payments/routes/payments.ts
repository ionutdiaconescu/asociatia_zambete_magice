export default {
  routes: [
    {
      method: "GET",
      path: "/payments/status",
      handler: "payments.status",
      config: {
        auth: false,
        policies: [],
      },
    },
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
