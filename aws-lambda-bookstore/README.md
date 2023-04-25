# Design High-Performance Apps Using Serverless Technologies Like TiDB and AWS Lambda

[TiDB](https://github.com/pingcap/tidb) is an open-source, MySQL-compatible NewSQL database that offers horizontal scalability, consistency, and high availability. [TiDB Cloud](https://docs.pingcap.com/tidbcloud/tidb-cloud-intro) is its fully-managed Database-as-a-Service (DBaaS). It lets you deploy your infrastructure at scale cost-efficiently without managing server infrastructure.

This doc demonstrates how you can employ TiDB Cloud in your serverless applications on [AWS Lambda](https://aws.amazon.com/lambda/) by constructing a bookstore management API. The API will enable end-users to perform actions such as listing, creating, updating, and deleting books.

![AWS Lambda secure interaction with TiDB Cloud using API Gateway](https://user-images.githubusercontent.com/56986964/234158086-bad0d094-4ff6-4daf-b497-385824e50fd6.png "image_tooltip")

_AWS Lambda secure interaction with TiDB Cloud using API Gateway_

## Prerequisites

Before you get started, complete the following prerequisites:

- [Create a TiDB Cloud account](https://tidbcloud.com/signup)
- [Create an AWS account](https://aws.amazon.com/), which can access AWS Lambda, API Gateway, Secrets Manager, and the AWS Cloud9 integrated development environment (IDE)
- [Set up AWS Cloud9 IDE](https://docs.aws.amazon.com/cloud9/latest/user-guide/setting-up.html)

## Accessing TiDB Cloud from AWS Lambda

To access TiDB Cloud from AWS Lambda:

1. [Create a TiDB Cloud cluster](#create-a-tidb-cloud-cluster).
2. [Store authentication credentials in Secrets Manager](#store-authentication-credentials-in-secrets-manager).
3. [Create an AWS Lambda function](#create-an-aws-lambda-function).
4. [Package Lambda code(ignore if use `us-east-1` region)](#package-lambda-code).
5. [Deploy your AWS Lambda function](#deploy-your-aws-lambda-function).
6. [Verify results with the AWS API Gateway](#verify-results-with-the-aws-api-gateway).

### Create a TiDB Cloud cluster

1. On the [TiDB Cloud Sign Up page](https://tidbcloud.com/signup), sign in using the link at the bottom of the page.

2. Click **Connect** to get TiDB Connection Information.

   ![Get TiDB Connection Information](https://user-images.githubusercontent.com/56986964/216237283-5fc6a68b-083f-4c5c-9926-ca36959a9b66.png "image_tooltip")

   _Get TiDB Connection Information_

3. Click **Reset password** and note down the root password.

### Store authentication credentials in AWS Secrets Manager

AWS Lambda supports integration with AWS Secrets Manager to securely store connection authentication credentials. To create these credentials:

1. On the Secrets Manager console, choose **Store a new secret**.

2. For **Select a secret type**, select **Other type of secret**.

3. Enter the following credentials:

   - TiDBHost
   - TiDBUser
   - TiDBPassword
   - TiDBPort (use **4000** as default)
   - TiDBDatabase (use **test** as default)

   Click **Next**.

4. For the **Secret name**, enter `aws/lambda/bookstore`.

5. Click **Next**.

6. Keep the **Disable automatic rotation** option selected.

7. Click **Next**.

8. Click **Store**.

### Create an IAM Role for Lambda

We will be using Secrets Manager in Lambda function. For this purpose, let's create an IAM Role for Lambda to access the Secrets Manager service.

1. Visit **IAM** service in **AWS Management Console** and click the **Roles**.

2. Click **Create role**, select **AWS service** as the trusted entity, and select **Lambda** as the use case.

3. Click **Next: Permissions**.
   Search and Select **SecretsManagerReadWrite**.
   Click **Clear filters**.
   Search and Select **AWSLambdaBasicExecutionRole**.

4. Click **Next**, input **LambdaSecretsManagerRole** as the role name, and click **Create role**.

### Create an AWS Lambda function

1. On the Lambda console, in the navigation pane, choose **Functions**.
2. Choose **Create function**.
3. For **Function name**, enter the name "bookstoreLambda" for your function.
4. For the **Execution role**, select **Use an existing role** and choose the **LambdaSecretsManagerRole** you just created.
5. Choose **Create function**.
6. Choose **Configuration** > **Edit**, set the **Timeout** to 15 seconds, and save.

   ![Choose Configuration and then Edit](https://user-images.githubusercontent.com/56986964/212818499-b1bd09ec-59bc-428a-b2d5-7f489cff46a4.png "image_tooltip")

   _Choose Configuration and then Edit_

This will create a blank function for you.

### Package Lambda code

> **Note:**
>
> Skip this step if you are using `us-east-1` region.

Check the demo [code repository](https://github.com/pingcap/TiDB-Lambda-integration) for a full example.

We recommend using the [AWS Cloud9](https://aws.amazon.com/cloud9/) IDE to have a consistent development environment, which is regardless of the local environment.

1. [Create](https://docs.aws.amazon.com/cloud9/latest/user-guide/create-environment.html) and [open](https://docs.aws.amazon.com/cloud9/latest/user-guide/open-environment.html) the AWS Cloud9 environment with default settings.
2. Execute `git clone https://github.com/pingcap/TiDB-Lambda-integration` in Cloud9 terminal to clone the code example.
3. Enter the folder by executing `cd TiDB-Lambda-integration/aws-lambda-bookstore`, this is the workspace in this demo.

Our goal is to build a book management API for a bookstore that will enable a user to list, create, update, and delete a book. The book will have a title, author, type, stock, price, and release date as its attribute, backed by a books table to store books. When a specific API is invoked, the event triggers the handler code which in-turn queries books from the `books` table in the `test` database.

The demo code should have three main parts: Secrets Manager, ORM and Lambda function handler, where Secrets Manager handles the database's secrets, ORM connects to the database and manages tables, and Lambda function handler processes events and API requests. Let's review them briefly.

#### Secrets Manager

We use the AWS Secrets Manager SDK to retrieve secrets from the secret aws/lambda/bookstore in region us-east-1. (We use us-east-1 as default. You should modify it to the same region as your Secrets Manager instance.)

The function initSecretManager initializes the Secrets instance and retrieves the stringified JSON object which contains the key-value pairs for all secrets.

![Secrets Manager](https://user-images.githubusercontent.com/56986964/212818563-71752e02-ec31-4f91-a5d0-5a15fbd12909.png "image_tooltip")

_Secrets Manager_

Next, we'll use these values in Node.js ORM to connect and operate on the database.

#### ORM

We use `Sequelize` to manage the database and execute commands. `src/sequelize/index.ts` initializes the ORM, and `src/sequelize/model.ts` defines the table schema.

Because TiDB is compatible with most MySQL functions and syntax, you may notice that the code uses `mysql2` as the driver. Also, because the TiDB Cloud cluster requires an SSL secure connection, we enable the `ssl` when configuring the database connection.

![Initialize Sequelize instance](https://user-images.githubusercontent.com/56986964/212818600-1c62f25d-ed2c-4a81-be24-dedc329e1616.png "image_tooltip")

_Initialize Sequelize instance_

![Initialize Book model](https://user-images.githubusercontent.com/56986964/212818645-ae73fe36-23d1-435c-92dd-a687ffb64128.png "image_tooltip")

_Initialize Book model_

Next we will use the Book model to operate commands on the target table. It will automatically create the target table if the table does not exist.

#### Lambda function handler

The Lambda function handler is a method that processes events when the function is invoked. In this example the Node.js web framework "Fastify" is used for handling API routes and the handler is exported as the entry point.

![alt_text](https://user-images.githubusercontent.com/56986964/212818681-7ced3561-5ee2-4d09-9dc2-fa233b65f126.png "image_tooltip")

_The Lambda function handler_

Let's walk through what's happening here.

First, we define some routers to list books, post a new book, update and delete the specified book.

Then, we define a function `initFastify` to initialize the `Fastify` instance and register all the routes. It makes sure that all requests will be proxied correctly.

Finally, we use `@fastify/aws-lambda` to wrap the function `initFastify`, and export it as the handler. The handler is the entry point for our AWS Lambda function. Due to the difference between Node.js environment and Serverless environment, we cannot use the function `getBook` directly. Fastify provides an official Lambda functions wrapper `@fastify/aws-lambda` to transfer a general function to the Lambda-adapted handler.

### Build a code bundle

> **Note:**
>
> Skip this step if you are using `us-east-1` region.

We cannot directly upload source code to Lambda functions, so we need to build and zip code. The final zip file has the `index.js` with the `handler`.

To create a code bundle and zip file:

1. Make sure you have opened the AWS Cloud9 environment, clone the code example and enter the correct workspace (refer to the section [Package Lambda code](#package-lambda-code)). All commands should be executed in the Cloud9 terminal.

2. Install the `yarn` package manager and dependencies:

   1. Run `npm i -g yarn`.
   2. Run `yarn.`

3. Build the code bundle:

   1. Run `yarn build.`
   2. After building successfully, a dist folder will be generated. Verify that an `index.zip` file is under the `dist` directory in workspace.
   3. Right click the zip file and choose **Download** to save on your local machine. We need to upload it when deploying the AWS Lambda function.

   ![Download the zip file](https://user-images.githubusercontent.com/56986964/212818746-0126c484-2a27-432e-bd6c-f8f6866d43cc.png "image_tooltip")

   _Download the zip file_

### Deploy your AWS Lambda function

If you are using `us-east-1` region, you can directly use Amazon S3 Location(https://tidb-lambda-integration.s3.amazonaws.com/bookstore-lambda-index.zip) to deploy your Lambda function. Otherwise, you need to deploy your code to your Lambda function by uploading the zip file you created earlier.

![Upload the zip file](https://user-images.githubusercontent.com/56986964/212818792-80f88d5e-f536-4307-9776-8d7937be9656.png "image_tooltip")

_Upload the zip file_

### Verify results with the AWS API Gateway

You're ready to test your functions:

1. Go to the [API Gateway console](https://console.aws.amazon.com/apigateway/main/apis).

2. Choose HTTP API type and click **Build** to create an API. Remember to add the integration to your Lambda function **bookstoreLambda**.

   ![Choose HTTP API type](https://user-images.githubusercontent.com/56986964/212818827-402201fc-2fff-4cd9-8f38-e858932ac6ab.png "image_tooltip")

   _Choose HTTP API type_

   ![Create an API](https://user-images.githubusercontent.com/56986964/212818852-d8ae779b-6e53-4a70-a480-ce09a56a4f4b.png "image_tooltip")

   _Create an API_

3. Click **Next** to configure Routes. Add `GET /book`, `GET /book/{id}` and` POST /book/init`. It is corresponding to the routes defined in our code.

   - `GET /book` (get all the books)
   - `GET /book/{id}` (get a specified book by ID)
   - `POST /book` (create a new book record)
   - `POST /book/init` (create a set of random book records)
   - `PUT /book/{id}` (update a specified book by ID)
   - `DELETE /book/{id}` (delete a specified book by ID)

   ![Configure routes](https://user-images.githubusercontent.com/56986964/212818923-9658c807-4698-4983-bc2b-d87a25210f2b.png "image_tooltip")

   _Configure routes_

4. For the other fields, use the default settings.

5. On the **Details** page, get your invoke URL.

   ![alt_text](https://user-images.githubusercontent.com/56986964/212818969-0ed449d6-22df-4ddd-aad1-20158c94dba8.png "image_tooltip")

   _Get your invoke URL_

6. Make API calls.
   - To initialize books, run `curl -X POST -H "Content-Type: application/json" -d '{"count":10}' https://<your-invoke-url>/book/init` and it will create table and insert ten random books.
   - To get all the books, run `curl https://<your-invoke-url>/book`.
   - To get a specified book whose ID is 1, run `curl https://<your-invoke-url>/book/1.`
   - To update a book whose ID is 2, run `curl -X PUT -H "Content-Type: application/json" -d '{ "title": "Book Title(updated)" }' https://<your-invoke-url>/book/2`
   - To create a new book, run `curl -X POST -H "Content-Type: application/json" -d '{ "title": "Book Title", "type": "Test", "publishAt": "2022-12-15T21:01:49.000Z", "stock": 123, "price": 12.34, "authors": "Test Test" }' https://<your-invoke-url>/book`
   - To delete a book whose ID is 3, run `curl -X DELETE https://<your-invoke-url>/book/3`
   - Finally, get all the books again by running `curl https://<your-invoke-url>/book`. Your response will look similar to the following: `{"book":"book","method":"GET","query":{},"result":[...]}`.

Congratulations! Your Lambda function can now read data from your TiDB Cloud database.

## **Clean up your resources (optional)**

To avoid any unnecessary charges to your AWS account, you can now delete the resources that were created for this blog, unless you wish to retain them.

Delete the Lambda function by navigating to the [Functions page](https://console.aws.amazon.com/lambda/home#/functions) of the Lambda console, selecting the function that was created and choosing **Actions** and **Delete**.

Delete the execution role by navigating to the [Roles page](https://console.aws.amazon.com/iamv2/home#/roles) of the IAM console, selecting the role that was created and choosing **Delete**.

Delete the API Gateway by navigating to the [APIs page](https://console.aws.amazon.com/apigateway/main/apis) of the API Gateway console, selecting the API that was created and choosing **Actions** and **Delete**.

Navigate to the [Secret List page](https://console.aws.amazon.com/secretsmanager/listsecrets), select the Secret that you created earlier and delete it by choosing **Actions** and **Delete**.
