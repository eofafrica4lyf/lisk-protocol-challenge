const { getBlocksData } = require("../../shared/utils/redis");

const calculateAverageRewardTransfer = async () => {
	const blocksData = await getBlocksData();
	return JSON.parse(blocksData);
};

module.exports = {
	calculateAverageRewardTransfer,
};
