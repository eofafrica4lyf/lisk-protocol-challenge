const {
	getCurrentBlockHeight,
	getBlockInfoBetweenHeight,
} = require("../../shared/dataService/blocks");
const { api } = require("../../shared/helpers/api");

let spy;
let currentHeight;
describe("Blocks API", () => {
	beforeEach(() => {
        currentHeight = 20225582
        spy = jest
			.spyOn(api, "get")
			.mockImplementation(() => ({ data: { height: currentHeight } }));
	});

	describe("getCurrentBlockHeight Function", function () {
		it("should call the mainnet api and get the current block height", async () => {
			const data = await getCurrentBlockHeight();
			expect(data).toEqual(currentHeight);
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});
    
	describe("getBlockInfoBetweenHeight Function", function () {
        it("should call the Core API ", async () => {
            const startingHeight = 0;
            const endingHeight = 10;
            const data = await getBlockInfoBetweenHeight(startingHeight, endingHeight);
			expect(data.length).toEqual(endingHeight  - startingHeight);
            expect(spy).toHaveBeenCalledTimes(10);
		});
	});

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });
});
