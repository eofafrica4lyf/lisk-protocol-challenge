const { api } = require("../helpers/api");
const { setData: setDataInRedis } = require("../utils/redis");

const getCurrentBlockHeight = async () => {
	// No try catch block; we assumed that the remote server is 100% reliable
	const data = await api.get("https://mainnet.lisk.com/api/node/info");
	return data.data.height;
};

const getBlockInfoBetweenHeight = async (startingHeight, endingHeight) => {
	let requestArray = [];
	for (let i = startingHeight; i < endingHeight; i++) {
		requestArray.push(
			api.get(`https://mainnet.lisk.com/api/blocks?height=${i}`)
		);
	}
	return await Promise.all(requestArray);
};

const aggregateResult = async (txnsArray) => {
	const totalTransferValue = txnsArray.reduce((acc, curVal) => {
		// allow for cases where there is no stated amount, instead there is a votes array of objects
		// that contain delegateAddress and amount properties, since there is no indication of the
		// particular vote that was chosen as amount, I omitted transactions such as this.
		return acc + Number(curVal.asset.amount || 0);
	}, 0);
	return totalTransferValue;
};

const getTxnsAggregate = async (height) => {
	try {
		let currentHeight = await getCurrentBlockHeight();
		let fromHeight, toHeight;

		// Batch up requests/promises; the size of each batch is assigned to variable callUnit
		let requestArray = [];
		let callUnit = 1000; // found to be consistent/optimal at this value
		for (let i = 0; i < height / callUnit; i++) {
			fromHeight = currentHeight - callUnit * (i + 1) + 1;
			toHeight = currentHeight - callUnit * i;

			let batch = await getBlockInfoBetweenHeight(fromHeight, toHeight);

			const aggregatedBatch = batch.reduce((acc, curVal) => {
				return curVal.data[0].payload
					? [
							...acc,
							...curVal.data[0].payload.filter(
								(txn) => txn.moduleID === 2 && txn.assetID === 0
							),
					  ]
					: acc;
			}, []);
			requestArray = [...requestArray, ...aggregatedBatch];
		}

		const totalTransferValue = await aggregateResult(requestArray);

		const count = requestArray.length;
		return {
			average: Number((totalTransferValue / count).toFixed(2)),
			total: totalTransferValue,
			count,
		};
	} catch (error) {
		console.log(error.message);
	}
};

const cacheTransactionsData = async (height) => {
	const data = await getTxnsAggregate(height);

	if (data) await setDataInRedis(data);
	return;
};
module.exports = {
    getCurrentBlockHeight,
    getBlockInfoBetweenHeight,
    aggregateResult,
	getTxnsAggregate,
	cacheTransactionsData,
};
