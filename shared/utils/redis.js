const { CacheRedis } = require("lisk-service-framework");
const config = require("../../config");
const cache = CacheRedis("blocks-data", config.redis);

const getBlocksData = async () => {
	return await cache.get("blocks-data");
};

const setData = async (data) => {
	return await cache.set("blocks-data", JSON.stringify(data));
};

module.exports = {
	getBlocksData,
	setData,
};
