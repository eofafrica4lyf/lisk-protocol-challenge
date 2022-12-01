# Coding Challenge for Lisk Service

This repository contains a sample application that needs to be modified in order to produce certain results.

Prepare a microservice that allows using the external API and is able to parse and aggregate desired data.

## How to test the service

- Run the following commands:
```bash
npm install
```
```bash
npm start
```
- Ensure you're running a local Redis server at port 6379
- Observe the job which runs to aggregate the data and cache it.
- Open a new terminal(ensure that you are still in the root directory of this repo)
Run
```bash
node moleculer_client.js svc.average.reward.transfer
```
You should get the response printed to the terminal.


Please have a look at the [CASE-STUDY.md file](https://github.com/eofafrica4lyf/lisk-protocol-challenge/blob/main/CASE-STUDY.md) for detailed information about my approach to solving the challenge.

Thank you.


