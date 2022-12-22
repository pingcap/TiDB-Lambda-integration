import Fastify, { FastifyInstance, FastifyRequest } from "fastify";

import { getBookRoutes } from "./routers/getBook";
import { postBookRoutes } from "./routers/postBook";
import { updateBookRoutes } from "./routers/putBook";
import { deleteBookRoutes } from "./routers/deleteBook";

async function commonRoutes(fastify: FastifyInstance, options: any) {
  fastify.all(`/`, async (request, reply) => {
    reply.type("application/json").code(200);
    reply.send({ hello: "world" });
    return { hello: "world" };
  });

  fastify.all(`/healthy`, async (request, reply) => {
    reply.type("application/json").code(200);
    const resData = { healthy: true, timestamp: new Date().getTime() };
    reply.send(resData);
    return resData;
  });
}

function initFastify() {
  const fastify = Fastify({
    logger: true,
  });
  fastify.register(commonRoutes);
  return fastify;
}

// GET /book
// GET /book/:id
export function getBook() {
  const app = initFastify();
  app.register(getBookRoutes);
  return app;
}

// POST /book
// POST /book/init
export function postBook() {
  const app = initFastify();
  app.register(postBookRoutes);
  return app;
}

// PUT /book/:id
export function putBook() {
  const app = initFastify();
  app.register(updateBookRoutes);
  return app;
}

// DELETE /book/:id
export function deleteBook() {
  const app = initFastify();
  app.register(deleteBookRoutes);
  return app;
}

if (require.main === module) {
  console.log("Running as a script");
  initFastify().listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    // Server is now listening on ${address}
  });
}
