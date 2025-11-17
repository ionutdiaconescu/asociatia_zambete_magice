'use strict';
const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::page.page');
      config: { policies: [], middlewares: [] },
    },
    {
      method: "GET",
      path: "/pages/:id",
      handler: "page.findOne",
      config: { policies: [], middlewares: [] },
    },
  ],
};
