const { getBlocksData } = require("../../shared/utils/redis");

/**
 * @desc Get saved aggregated average transfer value data
 */
const calculateAverageRewardTransfer = async () => {
	const blocksData = await getBlocksData();
	return JSON.parse(blocksData);
};

module.exports = {
	calculateAverageRewardTransfer,
};
