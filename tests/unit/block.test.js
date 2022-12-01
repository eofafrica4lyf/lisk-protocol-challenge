// For some unknown reason, I'm not able to properly mock(stub) some functions (to write more proper tests), 
// hence I've used Jest spys more than usual (like in the cacheTransactionsData test for example).
let {
	getCurrentBlockHeight,
	getBlockInfoBetweenHeight,
    getTotalTransferValue,
    getTxnsAggregate,
    cacheTransactionsData
} = require("../../shared/dataService/blocks");
const BlocksModule = require("../../shared/dataService/blocks");
const { api } = require("../../shared/helpers/api");
const { transactionsArray, totalTransferValue, currentBlockData } = require("./expectedResponse/http/blocks");
const blocksData = require("../unit/expectedResponse/http/blocks.json");

let mockApiGetCall;
let currentHeight;
let block;
let mockGetTxnsAggregateFunction;
describe("Blocks API", () => {
	describe("getCurrentBlockHeight Function", function () {
        beforeEach(() => {
            currentHeight = currentBlockData.data.height;
            mockApiGetCall = jest
                .spyOn(api, "get")
                .mockImplementationOnce(() => currentBlockData)
        });
		it("should call the mainnet api and get the current block height", async () => {
			const data = await getCurrentBlockHeight();
			expect(data).toEqual(currentHeight);
			expect(mockApiGetCall).toHaveBeenCalledTimes(1);
		});
        afterEach(() => {
            mockApiGetCall.mockRestore()
        });
	});
    
	describe("getBlockInfoBetweenHeight Function", function () {
        beforeEach(() => {
            currentHeight = currentBlockData.data.height;
            mockApiGetCall = jest
                .spyOn(api, "get")
                .mockImplementation(() => blocksData[0]);
        });
        it("should call the Core API ", async () => {
            const startingHeight = 1;
            const endingHeight = 10;
            const data = await getBlockInfoBetweenHeight(startingHeight, endingHeight);
			expect(data.length).toEqual(endingHeight  - startingHeight + 1);
            expect(mockApiGetCall).toHaveBeenCalledTimes(endingHeight - startingHeight + 1);
		});
        afterEach(() => {
            mockApiGetCall.mockRestore()
        });
	});
	
    describe("getTotalTransferValue Function", function () {
        it("should get the total transfer value for an array or transactions", async () => {
            const data = await getTotalTransferValue(transactionsArray);
			expect(data).toEqual(totalTransferValue);
		});
	});

    describe("getTxnsAggregate Function", function () {
        beforeEach(() => {
            block = blocksData[3];
            currentHeight = currentBlockData.data.height;
        });
        it("should get count, total and average transfer values on getting the height", async () => {
            mockApiGetCall = jest
                .spyOn(api, "get")
                .mockImplementationOnce(() => currentBlockData)
                .mockImplementation(() => block)

            const height = 20;
            const batchSize = 5;
            const data = await getTxnsAggregate(height, batchSize);

			expect(data.average).toEqual(Number(block.data[0].payload[0].asset.amount));
			expect(data.count).toEqual(height);
			expect(data.total).toEqual(Number(height * block.data[0].payload[0].asset.amount));
            expect(mockApiGetCall).toHaveBeenCalledTimes(height + 1);
            mockApiGetCall.mockRestore();
		});
        it("should should throw an error while fetching data", async () => {
            const errorMessage = "Failed to fetch block data!";
            mockApiGetCall = jest
                .spyOn(api, "get")
                .mockImplementationOnce(() => currentBlockData)
                .mockImplementation(() => {
                    throw new Error(errorMessage)
                });

            const height = 20;
            const batchSize = 5;
            try {
                await getTxnsAggregate(height, batchSize);
            } catch (error) {
                expect(error.message).toEqual(errorMessage)
            }
		});
        afterEach(() => {
            mockApiGetCall.mockRestore()
        });
	});
    
    describe("cacheTransactionsData Function", function () {
        beforeEach(() => {
            block = blocksData[3];
            currentHeight = currentBlockData.data.height;
            
            mockApiGetCall = jest
                .spyOn(api, "get")
                .mockImplementationOnce(() => currentBlockData)
                .mockImplementation(() => block)
        });
        it("should get count, total and average transfer values on getting the height", async () => {
            const height = 20;
            const batchSize = 5;
            await cacheTransactionsData(height, batchSize);
            expect(mockApiGetCall).toHaveBeenCalledTimes(1 + height);
		});
        
        afterEach(() => {
            mockApiGetCall.mockRestore()
        });
	});
});
