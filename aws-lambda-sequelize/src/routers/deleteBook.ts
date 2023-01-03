import { FastifyInstance } from "fastify";
import { Op } from "sequelize";

import { loadSequelize } from "../sequelize";
import { getBookModel } from "../sequelize/model";

const PREFIX = "/book";

export async function deleteBookRoutes(fastify: FastifyInstance, options: any) {
  fastify.delete(PREFIX + `/:id`, async (request, reply) => {
    const { id } = request.params as { [key: string]: string };
    const result = await deleteBookById(parseInt(id));
    reply
      .type("application/json")
      .code(200)
      .send(
        JSON.stringify({
          book: "book",
          method: `${request.method}`,
          result,
        })
      );
  });
}

async function deleteBookById(id: number) {
  const sequelizeInstance = await loadSequelize();
  const Book = getBookModel(sequelizeInstance);
  await Book.sync();
  const result = await Book.destroy({
    where: {
      id: {
        [Op.eq]: id,
      },
    },
  });
  sequelizeInstance.close();
  return result;
}
