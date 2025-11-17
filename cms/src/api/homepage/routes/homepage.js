'use strict';
const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::homepage.homepage');
      config: { policies: [], middlewares: [] },
    },
    {
      method: "PUT",
      path: "/homepage",
      handler: "homepage.update",
      config: { policies: [], middlewares: [] },
    },
  ],
};
