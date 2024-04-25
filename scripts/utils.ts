import Irys from "@irys/sdk";
import { defineChain } from "viem";
import { sepolia } from "viem/chains";
import validatedEnv from "../env";
import * as readline from "readline";
import BigNumber from "bignumber.js";

const promptContinue = (promptText: string): Promise<boolean> => {
	return new Promise((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(`${promptText}? Y/n: `, (answer) => {
			rl.close();
			const trimmedAnswer = answer.trim().toLowerCase();
			resolve(trimmedAnswer === "y" || trimmedAnswer === "");
		});
	});
};

const fundIrys = async (amount: BigNumber) => {
	console.log(`Funding ${amount.toString()}`);
	const irys = await getIrys();
	await irys.fund(amount);
	console.log(`Successfully funded ${irys.utils.fromAtomic(amount)} ${irys.token}`);
};

/**
 * @dev Custom chain configuration
 */
export const chainConfiguration = sepolia;

// export const chainConfiguration = defineChain({
// 	id: parseInt(validatedEnv.CHAIN_ID!),
// 	name: validatedEnv.CHAIN_NAME!,
// 	network: validatedEnv.CHAIN_NETWORK,
// 	nativeCurrency: {
// 		decimals: parseInt(validatedEnv.CURRENCY_DECIMALS!),
// 		name: validatedEnv.CURRENCY_NAME!,
// 		symbol: validatedEnv.CURRENCY_SYMBOL!,
// 	},
// 	rpcUrls: {
// 		default: {
// 			http: [validatedEnv.RPC_URL_DEFAULT_HTTP!],
// 		},
// 		public: {
// 			http: [validatedEnv.RPC_URL_PUBLIC_HTTP!],
// 		},
// 	},
// 	blockExplorers: {
// 		default: { name: validatedEnv.BLOCK_EXPLORER_NAME!, url: validatedEnv.BLOCK_EXPLORER_URL! },
// 	},
// });

interface IrysConfig {
	network: string;
	token: string;
	key: string;
	config: {
		providerUrl: string;
	};
}

const getIrys = async (): Promise<Irys> => {
	const network: string = validatedEnv.IRYS_NETWORK;
	const token: string = validatedEnv.IRYS_TOKEN;
	const key: string = validatedEnv.PRIVATE_KEY;
	const providerUrl: string = validatedEnv.IRYS_PROVIDER_URL!;

	const irysConfig: IrysConfig = {
		network,
		token,
		key,
		config: { providerUrl },
	};

	const irys = new Irys(irysConfig);
	return irys;
};

const ensureTrailingSlash = (url: string): string => {
	return url.endsWith("/") ? url : `${url}/`;
};

const getImageBase = (): string | false => {
	const irysGateway: string = ensureTrailingSlash(validatedEnv.IRYS_GATEWAY || "");
	const imageMutable: boolean = validatedEnv.IMAGE_MUTABLE === "true";

	return imageMutable ? `${irysGateway}mutable/` : irysGateway;
};

const getMetadataBase = (): string | false => {
	const irysGateway: string = ensureTrailingSlash(validatedEnv.IRYS_GATEWAY || "");
	const metadataMutable: boolean = validatedEnv.METADATA_MUTABLE === "true";

	return metadataMutable ? `${irysGateway}mutable/` : irysGateway;
};

export { getIrys, getImageBase, getMetadataBase, promptContinue, fundIrys };
