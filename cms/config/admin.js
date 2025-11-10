// Ultra-clean admin config for JavaScript error fix
module.exports = ({ env }) => ({
  auth: { 
    secret: env("ADMIN_JWT_SECRET") 
  },
  apiToken: { 
    salt: env("API_TOKEN_SALT") 
  },
  transfer: { 
    token: { 
      salt: env("TRANSFER_TOKEN_SALT") 
    } 
  },
  url: "/admin",
  autoOpen: false,
  // Disable problematic features that might cause JS errors
  rateLimit: {
    enabled: false
  }
});