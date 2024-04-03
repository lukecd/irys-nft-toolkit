import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
	// Irys variables
	IRYS_GATEWAY: z.string(),
	METADATA_MUTABLE: z.string(),
	IMAGE_MUTABLE: z.string(),
	PRIVATE_KEY: z.string(),
	IRYS_PROVIDER_URL: z.string().optional(),
	IRYS_NETWORK: z.string(),
	IRYS_TOKEN: z.string(),

	// NFT Metadata Fields
	NAME: z.string(),
	DESCRIPTION: z.string(),
	EXTERNAL_URL: z.string(),
	BACKGROUND_COLOR: z.string(),
	ANIMATION_URL: z.string().optional(),

	// Attributes
	ATTRIBUTES: z.string().optional(),

	// Directories & images
	IMAGE_DIR: z.string(),
	METADATA_DIR: z.string(),
	ACCEPTED_IMAGE_TYPES: z.string(),

	// Contract information
	CONTRACT_ADDRESS: z.string(),
	CONTRACT_TYPE: z.string(),

	// Chain information
	CHAIN_ID: z.string(),
	CHAIN_NAME: z.string(),
	CHAIN_NETWORK: z.string(),
	CURRENCY_DECIMALS: z.string(),
	CURRENCY_NAME: z.string(),
	CURRENCY_SYMBOL: z.string(),
	RPC_URL_DEFAULT_HTTP: z.string(),
	RPC_URL_PUBLIC_HTTP: z.string(),
	BLOCK_EXPLORER_NAME: z.string(),
	BLOCK_EXPLORER_URL: z.string(),
});

// Attempt to parse and validate the environment variables
// Throws an error if validation fails
const validatedEnv = envSchema.parse(process.env);

export default validatedEnv;
