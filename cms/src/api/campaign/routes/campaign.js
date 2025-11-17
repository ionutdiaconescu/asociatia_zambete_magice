'use strict';
const { factories } = require('@strapi/strapi');

module.exports = factories.createCoreRouter('api::campaign.campaign');
      config: { policies: [], middlewares: [] },
    },
    {
      method: "GET",
      path: "/campaigns/:id",
      handler: "campaign.findOne",
      config: { policies: [], middlewares: [] },
    },
  ],
};
