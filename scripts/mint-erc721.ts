import { createWalletClient, createPublicClient, defineChain, http, encodeAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { chainConfiguration, getIrys } from "./utils";
import { abi721 } from "./abis";
import validatedEnv from "../env";
import { promises as fs } from "fs";

interface MetadataEntry {
	metadataName: string;
	metadataUrl: string;
}

interface MintLogEntry {
	destinationAddress: string;
	metadataUrl: string;
	tokenId: number;
}

const account = privateKeyToAccount(`${validatedEnv.PRIVATE_KEY}` as `0x${string}`);
const address = `${validatedEnv.CONTRACT_ADDRESS}` as `0x${string}`;

export const walletClient = createWalletClient({
	chain: chainConfiguration,
	transport: http(),
});
const publicClient = createPublicClient({
	chain: chainConfiguration,
	transport: http(),
});

const mintNft = async (mintTo: string, uri: string): Promise<number> => {
	console.log(`Minting ${uri} to ${mintTo}`);
	const hash = await walletClient.writeContract({
		account,
		address,
		abi: abi721,
		functionName: "mintTo",
		args: [mintTo, uri],
	});
	// console.log({ hash });

	const receipt = await publicClient.waitForTransactionReceipt({ hash });
	// console.log({ receipt });

	const tokenId = parseInt(receipt.logs[0].data, 16);
	// console.log({ tokenId });
	return tokenId;
};

// Helper function to check if a string is a valid URL
const isValidUrl = (urlString: string): boolean => {
	try {
		new URL(urlString);
		return true;
	} catch (error) {
		return false;
	}
};

const validateMetadata = async (jsonFile: string): Promise<boolean> => {
	try {
		// Read & parse the JSON file
		const data = await fs.readFile(jsonFile, "utf8");
		const entries: MetadataEntry[] = JSON.parse(data);

		// Validate each entry
		for (const entry of entries) {
			// Check if the metadataUrl field is valid
			if (!entry.metadataUrl || !isValidUrl(entry.metadataUrl)) {
				console.error(`Invalid metadataUrl in entry: ${entry.metadataName}`);
				return false;
			}
		}

		console.log("All metadata entries are valid.");
		return true;
	} catch (error) {
		console.error("Error validating metadata:", error);
		return false;
	}
};

const mintAll = async () => {
	const destinationAddress = (await getIrys()).address!;
	const mintLogs: MintLogEntry[] = [];

	const metadata = process.argv[2];
	if (await validateMetadata(metadata)) {
		const data = await fs.readFile(metadata, "utf8");
		const entries = JSON.parse(data);

		for (const entry of entries) {
			const tokenId = await mintNft(destinationAddress, entry.metadataUrl);
			mintLogs.push({
				destinationAddress,
				metadataUrl: entry.metadataUrl,
				tokenId,
			});
		}
		await fs.writeFile("mintLog.json", JSON.stringify(mintLogs, null, 2), "utf8");
		console.log("Minting log saved to mintLog.json");
	}
};

async function main(): Promise<void> {
	try {
		await mintAll();
		return;
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

main();
