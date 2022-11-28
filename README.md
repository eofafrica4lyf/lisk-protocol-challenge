# Coding Challenge for Lisk Service

This repository contains a sample application that needs to be modified in order to produce certain results.

Prepare a microservice that allows using the external API and is able to parse and aggregate desired data.

## Requirements

The program has to meet several requirements:

- It has to produce the right results.
- Take your time, there is no hard deadline for this challenge, but normally it is developed around four hours.
- Use the Node.js 14.x environment as this is the preferred way to solve this task.
- The code does not have to be perfect, but you need to be able to explain how things could be improved. (e.g., you could note that, "I am not checking the return value here")
- You should be able to explain any choices or assumptions you made.
- You can make those explanations in the comments.
- If you have any questions, feel free to contact us at sameer.subudhi@lightcurve.io

## Problem Description

The application is based on the `lisk-service-framework`. This library allows you to perform HTTP requests and store temporary data.

Use these capabilities to retrieve data from the original Lisk Service and aggregate them.

For this task we can assume the remote server is 100% reliable. Lisk Service Framework retries the data retrieval in case of errors.

Retrieve blocks from https://mainnet.lisk.com and calculate an average balance transfer for the last n blocks.

- Create a method to retrieve blocks between a certain height using the url from https://mainnet.lisk.com/api/blocks?height= and calculate and average reward transfer for those blocks.
- Please consider only transfer transactions, with the criteria: `moduleID=2` and `assetID=0`
- Note that not all blocks have transfer transactions. There can be blocks with no transactions and blocks with different `module`/`assetID`.
- Create a job that retrieves and aggregates the data for the last 10000 blocks. The result has to be stored into the Redis database. In order to reveal the last block height use the following endpoint: https://mainnet.lisk.com/api/node/info (`data.height`).
- Create a method that allows to retrieve the data from the temporary storage (Redis).
- Use the following [documentation](https://lisk.com/documentation/lisk-core/reference/api.html#/Blocks/get_blocks)

## Prerequisites

In order to run this microservice, you need to have configured Node.js environment on a Unix-like system, such as Linux, MacOS or Windows-WSL.

The microservice architecture requires a message broker for data communication. Running instance of Redis database is necessary.

Additionally you need to perform the following commands:

```bash
npm install
```

## Running the service

```bash
npm start
```
or

```bash
npm watch
```

Press `Ctrl+C` in the terminal to stop the process.

## Testing

### Manual

For local debugging use the `moleculer_client.js` script that allows you to perform requests directly.

For example, to retrieve data from the `svc.status` method use the following syntax:

```
node moleculer_client.js svc.status
```

Response

```
{
  "status": "OK",
  "service": "lisk-service-template-moleculer",
  "version": "0.6.0-beta.0"
}
```

All available methods are listed during start of the service.

### Automatic

There are automatic tests in the `test/` folder. Make sure they pass before submitting the task.

## API Specifications

Refer to the [API documentation](https://lisk.com/documentation/lisk-service/references/api.html) on how to use Lisk Service HTTP endpoint.

The output should work as follows

```js
{
	"average": 20.36,
	"total": 112039.03,
	"count": 245
}
```

## Submission

Create a pull request in the GitHub repository with your changes.

Describe it briefly what did you change to achieve the challenge goals.

Use the opportunity to show your development skills especially if you are applying as senior developer. Simplicity is beauty.

We want to know why you make your choices. Please explain the
reasoning behind the choices you make.

We don't consider the time you take to polish your submission's
documentation to be part of the challenge's time limit.

Good luck.

-- The Lightcurve Lisk Service Team
