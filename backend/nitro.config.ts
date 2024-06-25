//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",

  routeRules: {
    "/**": {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': 'true', // Required for cookies, authorization headers with HTTPS
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Required for CORS support to work
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization', // Required for CORS support to work
      }
    },
  },

  imports: {
    dirs: ['./db/*']
  },

  runtimeConfig: {
    nitro: {
      envPrefix: 'REGISTRY_'
    },
    portableDid: '{}'
  }
});