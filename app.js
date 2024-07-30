const fastify = require("fastify");

function app(opts = {}) {
  const app = fastify(opts);
  const routes = require("./routes/index");
  const cors = require("@fastify/cors");
  const swagger = require("@fastify/swagger");
  const swaggerUi = require("@fastify/swagger-ui");


  app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  });

  app.register(routes, { prefix: "/pat" });

  app.get("/info", async (request, reply) => {
    return {
      service_name: "BRISMA 2.0.2 PAT SERVICE",
      status: "running",
    };
  });

  app.ready((err) => {
    if (err) throw err;
  });

  return app;
}

module.exports = app;
