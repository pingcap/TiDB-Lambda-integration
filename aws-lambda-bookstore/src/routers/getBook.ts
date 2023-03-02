import { FastifyInstance } from "fastify";
import { Op } from "sequelize";

import { loadSequelize } from "../sequelize";
import { getBookModel } from "../sequelize/model";

const PREFIX = "/book";

export async function getBookRoutes(fastify: FastifyInstance, options: any) {
  fastify.get(PREFIX, async (request, reply) => {
    try {
      const query = request.query as { [key: string]: string };
      const result = await listBooks(query);
      reply
        .type("application/json")
        .code(200)
        .send(
          JSON.stringify({
            book: "book",
            method: `${request.method}`,
            query,
            result,
          })
        );
    } catch (err: any) {
      console.error(err);
      reply.code(500).send({
        message: err.message,
      });
    }
  });

  fastify.get(PREFIX + `/:id`, async (request, reply) => {
    const { id } = request.params as { [key: string]: string };
    const result = await queryBookByID(id);
    reply
      .type("application/json")
      .code(200)
      .send(
        JSON.stringify({
          book: "book",
          method: `${request.method}`,
          id,
          result,
        })
      );
  });
}

async function listBooks(query: any) {
  try {
    const sequelizeInstance = await loadSequelize();
    const Book = getBookModel(sequelizeInstance);
    await Book.sync();
    const result = await Book.findAll();
    sequelizeInstance.close();
    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

async function queryBookByID(id: string) {
  try {
    const sequelizeInstance = await loadSequelize();
    const Book = getBookModel(sequelizeInstance);
    await Book.sync();
    const result = await Book.findOne({
      where: {
        id: {
          [Op.eq]: parseInt(id),
        },
      },
    });
    sequelizeInstance.close();
    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

interface NewBook {
  title: string;
  type: string;
  stock: number;
  price: number;
  authors: string;
  publishAt: string;
}
