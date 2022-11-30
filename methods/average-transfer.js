/*
 * LiskHQ/lisk-service
 * Copyright © 2019 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

const {
	calculateAverageRewardTransfer,
} = require("./controllers/average-transfer");
module.exports = [
	{
		name: "average.reward.transfer",
		description:
			"Retrieve average reward transfer for transactions belonging to blocks between a certain height",
		controller: calculateAverageRewardTransfer,
	},
];
