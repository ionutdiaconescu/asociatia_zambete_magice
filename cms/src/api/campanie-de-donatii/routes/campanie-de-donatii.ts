/**
 * campanie-de-donatii router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::campanie-de-donatii.campanie-de-donatii",
  {
    config: {
      find: {
        policies: [],
        middlewares: [],
      },
      findOne: {
        policies: [],
        middlewares: [],
      },
    },
  }
);
