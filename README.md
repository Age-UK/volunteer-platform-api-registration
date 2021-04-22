# Age UK Volunteer Platform

The volunteer platform establishes a central point for potential volunteers to register for volunteering opportunities offered by Age Uk.

The platform also provides those working at charity HQ with administrative oversight over all volunteers who are interested or actively involved in volunteering opportunities.

Individuals/admins working within a particular division are only authorised to view volunteers that are interested or active within their division.

Users are assigned one of the following roles

- Master Admin - can access all volunteer data across all divisions
- Division Manager - can access all volunteer data within a single division
- Volunteer - can only view data relating to themselves

## Overview

This is the server-side repoitory for the public volunteer registration.

**This repository should be deployed SECOND, following the deployment of the admin repository**

This repo uses a CloudFormation script to create a API gateway and Lambda function to handle registration services.

## Pre-requisites

**An AWS Account**

[AWS - Getting Started](https://aws.amazon.com/getting-started/)

Note: An IAM user with full admin access is advised

**NodeJS (v12+) & NPM**

[Install NodeJs and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)


**Typescript**

[Install Typescript](https://www.typescriptlang.org/download)

**AWS CLI**

[Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)


**Serverless Framework**

```bash
npm install -g serverless
```

## Deployment & Installation

**Setup .env file**

Rename (or copy) .env.example to .env.dev

Set the following keys

 - DATABASE_NAME=(take from admin API .env)
 - DATABASE_USER=(take from admin API .env)
 - DATABASE_PASSWORD=(take from admin API .env)
 - S3_BUCKET_NAME=(unique S3 bucket name for registration front end)
 - VOLNODEJS_LAYER_ARN=(package layer ARN installed as part of admin API deployment)
 - VOLPLATFORM_LAYER_ARN=(the ARN of the volplatform layer created by the cloudformation script see Lambda > Layers)

Setting the subnet and security group keys

In order to find the relevant subnet and security group names navigate to the Lambda function created by the admin API repo .i.e Services > Lambda > Functions > [ADMIN-API-FUNCTION-NAME] > Configuration tab > VPC.  Codes similar to the examples below should be diplayed.  Copy these code and add them to .env.dev

 - SECURITY_GROUP_ID=sg-0000000000000000
 - SUBNET_A_ID=subnet-00000000000000000
 - SUBNET_B_ID=subnet-00000000000000001

**Run Cloudformation Script**

The serverless.yml file contains a cloudformation script that will deploy the cloud infratructure.  Run the following:

```bash
sls deploy --region eu-west-2 --stage dev
```


## Running the Volunteer Platform Regitration API locally

The volunteer platform registration API can be run locally via serverless offline.

You should use the non-VPC test database created as part of the admin API deployment.

Rename (or copy) .env.example.local to .env.local

Set the following keys

 - DATABASE_NAME=(test DB name)
 - DATABASE_USER=(test db user name)
 - DATABASE_PASSWORD=(test db password)

To run locally run the following commands

```bash
npm install
```

```bash
sls offline start
```

## Additional Steps

**Finding the API URL for the regitration services**

In order to hook the admin-front-end up to the admin API created by this repository, you'll need the API URL.  Navigate to **Services** > **API Gateway** > [NEW-API] > **Stages** > [NEW-STAGE] > **Copy the invoke URL**

**Testing the API**

In order to establish that the API has been deployed correctly copy the invoke URL into a web browser followed by /divisions

e.g. https://n0000000000.execute-api.eu-west-2.amazonaws.com/dev/divisions

This should return an array of divisions.

## License
[GNU](https://choosealicense.com/licenses/gpl-3.0/)