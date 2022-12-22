import { FastifyInstance, FastifyRequest } from "fastify";
import { faker } from "@faker-js/faker";

import { loadSequelize } from "../sequelize";
import { getBookModel } from "../sequelize/model";
import { initSecretManager } from "../secretManager";

const PREFIX = "/book";

export async function postBookRoutes(fastify: FastifyInstance, options: any) {
  fastify.post(PREFIX, async (request, reply) => {
    const bodyData = request.body as BookBodyProps;
    const result = await postNewBook(bodyData);
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

  fastify.post(PREFIX + `/init`, async (request, reply) => {
    const bodyData = request.body as { count?: number; [key: string]: any };
    const { count } = bodyData;
    const result = await initBook(count);
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

export interface BookProps {
  title: string;
  type: string;
  stock: number;
  price: number;
  authors: string;
  publishAt: Date;
}

export interface BookBodyProps extends Omit<BookProps, "publishAt"> {
  publishAt: string;
}

async function postNewBook(bodyData: BookBodyProps) {
  const sequelizeInstance = await loadSequelize();
  const Book = getBookModel(sequelizeInstance);
  await Book.sync();
  const newBook = Book.build({
    ...bodyData,
    publishAt: new Date(bodyData.publishAt),
  });
  await newBook.save();
  sequelizeInstance.close();
  return newBook;
}

function createRandomBook(): BookProps {
  return {
    title: faker.lorem.words(3),
    type: faker.lorem.words(1),
    stock: faker.datatype.number({ min: 0, max: 200 }),
    price: faker.datatype.number({ min: 0, max: 200, precision: 0.01 }),
    authors: faker.name.fullName(),
    publishAt: faker.date.past(),
  };
}

async function initBook(count?: number) {
  const length = count || 100;
  const fakeBooks: BookProps[] = [];
  Array.from({ length }).forEach(() => {
    fakeBooks.push(createRandomBook());
  });

  const sequelizeInstance = await loadSequelize();
  const Book = getBookModel(sequelizeInstance);
  await Book.sync();
  const newBooks = await Book.bulkCreate(
    fakeBooks.map((book) => ({ ...book }))
  );
  sequelizeInstance.close();
  return newBooks;
}
