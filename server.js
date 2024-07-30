"use strict";

const dotenv = require("dotenv");
dotenv.config();
const server = require("./app")({
  logger: true,
});

try {
  server.listen({
    port: process.env.PORT || 2000,
    host: "0.0.0.0",
  });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
