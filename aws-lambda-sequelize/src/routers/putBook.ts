import { FastifyInstance, FastifyRequest } from "fastify";
import { Op } from "sequelize";

import { loadSequelize } from "../sequelize";
import { getBookModel } from "../sequelize/model";
import { initSecretManager } from "../secretManager";
import { BookProps, BookBodyProps } from "./postBook";

const PREFIX = "/book";

export async function updateBookRoutes(fastify: FastifyInstance, options: any) {
  fastify.put(PREFIX + `/:id`, async (request, reply) => {
    const { id } = request.params as { [key: string]: string };
    const bodyData = request.body as Partial<BookBodyProps>;
    const result = await updateBookById(parseInt(id), bodyData);
    reply
      .type("application/json")
      .code(200)
      .send(
        JSON.stringify({
          book: "book",
          method: `${request.method}`,
          body: bodyData,
          result,
        })
      );
  });
}

async function updateBookById(id: number, bodyData: Partial<BookBodyProps>) {
  const sequelizeInstance = await loadSequelize();
  const Book = getBookModel(sequelizeInstance);
  await Book.sync();
  const bookToUpdate: any = { ...bodyData };
  if (bookToUpdate.publishAt) {
    bookToUpdate.publishAt = new Date(bookToUpdate.publishAt);
  }
  const result = await Book.update(
    {
      ...bookToUpdate,
    },
    {
      where: {
        id: {
          [Op.eq]: id,
        },
      },
    }
  );
  sequelizeInstance.close();
  return result;
}
