import awsLambdaFastify from "@fastify/aws-lambda";
import { initFastify } from "./app";

export const handler = awsLambdaFastify(initFastify());
