export default {
  routes: [
    {
      method: "GET",
      path: "/campaigns",
      handler: "campaign.find",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/campaigns/:id",
      handler: "campaign.findOne",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
