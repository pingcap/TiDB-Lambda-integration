// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const SECRET_NAME = "aws/lambda/bookstore";

export type SecretType = {
  TiDBHost: string;
  TiDBPort: string;
  TiDBUser: string;
  TiDBPassword: string;
  TiDBDatabase: string;
};

export async function initSecretManager(): Promise<SecretType | null> {
  const client = new SecretsManagerClient({
    region: "us-east-1",
  });
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: SECRET_NAME,
        VersionStage: "AWSCURRENT",
      })
    );
    if (!response.SecretString) throw new Error("SecretString empty");
    return JSON.parse(response.SecretString);
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    console.error(error);
    return null;
  }
}
