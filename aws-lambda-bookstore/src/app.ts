import Fastify, { FastifyInstance } from "fastify";

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

export function initFastify() {
  const fastify = Fastify({
    logger: true,
  });
  fastify.register(commonRoutes);
  fastify.register(getBookRoutes);
  fastify.register(postBookRoutes);
  fastify.register(updateBookRoutes);
  fastify.register(deleteBookRoutes);
  return fastify;
}

// For local develop only
if (require.main === module) {
  console.log("Running as a script");
  initFastify().listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    // Server is now listening on ${address}
    console.log(`Server is now listening on ${address}`);
  });
}
