import awsLambdaFastify from "@fastify/aws-lambda";
import { getBook, postBook, putBook, deleteBook } from "./app";

const proxyGetBook = awsLambdaFastify(getBook());
const proxyPostBook = awsLambdaFastify(postBook());
const proxyPutBook = awsLambdaFastify(putBook());
const proxyDeleteBook = awsLambdaFastify(deleteBook());

export const getBookHandler = proxyGetBook;
export const postBookHandler = proxyPostBook;
export const putBookHandler = proxyPutBook;
export const deleteBookHandler = proxyDeleteBook;
