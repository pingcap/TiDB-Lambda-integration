import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

const SSL_FLAGS = "pool_timeout=60&sslaccept=accept_invalid_certs";

import { initSecretManager } from "../secretManager";

export async function loadSequelize() {
  const secret = await initSecretManager();

  const database = secret?.TiDBDatabase || process.env.DATABASE || "test";
  const userName = secret?.TiDBUser || process.env.TIDB_USER || "root";
  const password = secret?.TiDBPassword || process.env.TIDB_PASSWORD || "";

  const sequelize = new Sequelize(database, userName, password, {
    dialect: "mysql",
    // https://github.com/sequelize/sequelize/issues/9489
    dialectModule: mysql2,
    host: secret?.TiDBHost || process.env.TIDB_HOST || "localhost",
    port: parseInt(secret?.TiDBPort || process.env.TIDB_PORT || "4000"),
    dialectOptions: {
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      engine: "MYISAM",
      pool: {
        /*
         * Lambda functions process one request at a time but your code may issue multiple queries
         * concurrently. Be wary that `sequelize` has methods that issue 2 queries concurrently
         * (e.g. `Model.findAndCountAll()`). Using a value higher than 1 allows concurrent queries to
         * be executed in parallel rather than serialized. Careful with executing too many queries in
         * parallel per Lambda function execution since that can bring down your database with an
         * excessive number of connections.
         *
         * Ideally you want to choose a `max` number where this holds true:
         * max * EXPECTED_MAX_CONCURRENT_LAMBDA_INVOCATIONS < MAX_ALLOWED_DATABASE_CONNECTIONS * 0.8
         */
        max: 2,
        /*
         * Set this value to 0 so connection pool eviction logic eventually cleans up all connections
         * in the event of a Lambda function timeout.
         */
        min: 0,
        /*
         * Set this value to 0 so connections are eligible for cleanup immediately after they're
         * returned to the pool.
         */
        idle: 0,
        // Choose a small enough value that fails fast if a connection takes too long to be established.
        acquire: 3000,
        /*
         * Ensures the connection pool attempts to be cleaned up automatically on the next Lambda
         * function invocation, if the previous invocation timed out.
         */
        evict: 15000,
      },
    },
  });

  // or `sequelize.sync()`
  await sequelize.authenticate();

  return sequelize;
}
