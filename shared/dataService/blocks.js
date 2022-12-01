const { api } = require("../helpers/api");
const { setData: setDataInRedis } = require("../utils/redis");

/**
 * @desc Get the last block height
 */
const getCurrentBlockHeight = async () => {
	// No try catch block; we assumed that the remote server is 100% reliable
	const data = await api.get("https://mainnet.lisk.com/api/node/info");
	return data.data.height;
};

/**
 * @desc Get an array of block data between two heights.
 * @param {*} startingHeight marks the height (inclusive) to which fetching of data starts.
 * @param {*} endingHeight marks the height (inclusive) to which fetching of block data ends
 */
const getBlockInfoBetweenHeight = async (startingHeight, endingHeight) => {
	let requestArray = [];
	for (let i = startingHeight; i <= endingHeight; i++) {
		requestArray.push(
			api.get(`https://mainnet.lisk.com/api/blocks?height=${i}`)
		);
	}
    return await Promise.all(requestArray);
};

/**
 * @desc Get a single aggregated value of the total transfer values for all transactions in an array of transactions
 * @param {*} txnsArray array of transactions
 */
const getTotalTransferValue = async (txnsArray) => {
	const totalTransferValue = txnsArray.reduce((acc, curVal) => {
		// allow for cases where there is no stated amount, instead there is a votes array of objects
		// that contain delegateAddress and amount properties, since there is no indication of the
		// particular vote that was chosen as amount, I omitted transactions such as this.
		return acc + Number(curVal.asset.amount || 0);
	}, 0);
	return totalTransferValue;
};

/**
 * @desc Get aggregated data for all transactions in the last "height" blocks.
 * @param {number} height The number of blocks to process starting from the most recent block
 * @param {number} batchSize The number of indivdual requests for block data that is batched together at a time.
 */
const getTxnsAggregate = async (height, batchSize) => {
	try {
		let currentHeight = await getCurrentBlockHeight();
		let fromHeight, toHeight;

		// Batch up requests/promises; the size of each batch is assigned to variable batchSize
		let requestArray = [];

		// batchSize was found to be consistent/optimal at the value of 1000
        while (height > 0) {
            fromHeight = currentHeight - (height > batchSize ? batchSize : height) + 1;
            toHeight = currentHeight

			let batch = await getBlockInfoBetweenHeight(fromHeight, toHeight);

            // flatten array of blocks containing corresponding arrays of transactions into a single array of transactions.
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

            //update the current height of the blockchain
            currentHeight -= batchSize;
            // update the number of blocks that remain to be fetched
            height -= batchSize
		}

		const totalTransferValue = await getTotalTransferValue(requestArray);

		const count = requestArray.length;
		return {
			average: Number((count > 0 ? totalTransferValue / count : 0).toFixed(2)),
			total: totalTransferValue,
			count,
		};
	} catch (error) {
		console.log(error.message);
	}
};

/**
 * @desc Get aggregated transactions data and save in Redis
 * @param {number} height The number of blocks to process starting from the most recent block
 * @param {number} batchSize The number of indivdual requests for block data that is batched together at a time.
 */
const cacheTransactionsData = async (height, batchSize) => {
	const data = await getTxnsAggregate(height, batchSize);

	if (data) await setDataInRedis(data);
	return;
};

module.exports = {
    getCurrentBlockHeight,
    getBlockInfoBetweenHeight,
    getTotalTransferValue,
	getTxnsAggregate,
	cacheTransactionsData,
};
