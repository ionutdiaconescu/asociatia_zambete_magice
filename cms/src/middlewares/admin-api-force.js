module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Force API behavior for admin routes that should return JSON
    const adminApiRoutes = [
      "/admin/content-manager/",
      "/admin/upload/",
      "/admin/content-type-builder/",
      "/admin/users/",
      "/admin/roles/",
      "/admin/permissions/",
    ];

    const isAdminApiRoute = adminApiRoutes.some((route) =>
      ctx.path.startsWith(route)
    );

    if (isAdminApiRoute) {
      // Set headers to force JSON response
      ctx.request.headers.accept = "application/json";
      ctx.request.headers["content-type"] = "application/json";
    }

    await next();
  };
};
