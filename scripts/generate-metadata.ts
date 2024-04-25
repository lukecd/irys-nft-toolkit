import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import validatedEnv from "../env";
import { getIrys, getImageBase, getMetadataBase, promptContinue, fundIrys } from "./utils";
import BigNumber from "bignumber.js";

interface NFTMetadata {
	name: string;
	description: string;
	image: string; // URL to the image
	external_url?: string;
	attributes?: Attribute[];
	background_color?: string;
	animation_url?: string;
}

interface Attribute {
	trait_type: string;
	value: string | number;
}

const IMAGE_DIR = validatedEnv.IMAGE_DIR || "./images";
const IRYS_GATEWAY = validatedEnv.IRYS_GATEWAY || "https://gateway.irys.xyz";
const METADATA_DIR = validatedEnv.METADATA_DIR || "./metadata";
const ACCEPTED_IMAGE_TYPES = (validatedEnv.ACCEPTED_IMAGE_TYPES || "").split(",");
const OUTPUT_JSON_PATH = path.join(METADATA_DIR, "output.json");

const parseAttributes = (attributesJson: string): Attribute[] => {
	try {
		return JSON.parse(attributesJson);
	} catch (e) {
		console.error("Error parsing attributes:", e);
		return [];
	}
};

const metadata: NFTMetadata = {
	name: validatedEnv.NAME || "",
	description: validatedEnv.DESCRIPTION || "",
	image: "", // This will be set after uploading to Irys
	external_url: validatedEnv.EXTERNAL_URL,
	background_color: validatedEnv.BACKGROUND_COLOR,
	animation_url: validatedEnv.ANIMATION_URL,
	attributes: parseAttributes(validatedEnv.ATTRIBUTES || "[]"),
};

const ensureSufficientBalance = async (): Promise<boolean> => {
	const imageFiles = await fs.readdir(IMAGE_DIR);

	let totalBytes = 0;
	let totalFiles = 0;

	for (const filename of imageFiles) {
		const filePath = path.join(IMAGE_DIR, filename);
		const fileStats = await fs.stat(filePath);

		const fileExtension = path.extname(filename).toLowerCase();

		// Check if the file extension is in the list of accepted image types
		if (!ACCEPTED_IMAGE_TYPES.includes(fileExtension)) {
			totalBytes += fileStats.size;
			totalFiles++;
		}
	}
	const irys = await getIrys();
	const costToUpload = await irys.getPrice(totalBytes);
	const loadedBalance = await irys.getLoadedBalance();

	console.log(`Total size of ${imageFiles.length} images: ${totalBytes} bytes`);
	console.log(`Cost to upload ${irys.utils.fromAtomic(costToUpload)} ${irys.token}`);
	console.log(`Loaded balance ${irys.utils.fromAtomic(loadedBalance)} ${irys.token}`);

	if (costToUpload.isGreaterThan(loadedBalance)) {
		console.log(`Insufficient balance.`);
		const missingBalance = costToUpload.minus(loadedBalance);

		const shouldFund = await promptContinue(
			`Do you wish to fund ${irys.utils.fromAtomic(missingBalance)} ${irys.token}`,
		);
		if (shouldFund) {
			await fundIrys(missingBalance);
		}
		return false;
	} else {
		const shouldContinue = await promptContinue("Continue");
		if (!shouldContinue) {
			return false;
		}
	}

	return true;
};

/**
 *
 */
const uploadImagesAndUpdateMetadata = async (): Promise<void> => {
	// 1. Ensure user has a sufficient balance to upload images
	if (!(await ensureSufficientBalance())) return;

	const irys = await getIrys();
	const imageFiles = await fs.readdir(IMAGE_DIR);

	// Ensure the metadata directory exists
	await fs.mkdir(METADATA_DIR, { recursive: true });
	let entries: { metadataName: string; metadataUrl: string }[] = [];

	// 2. Upload files one at a time
	for (const filename of imageFiles) {
		const fileExtension = path.extname(filename).toLowerCase();

		// Check if the file extension is in the list of accepted image types
		if (!ACCEPTED_IMAGE_TYPES.includes(fileExtension)) {
			console.log(`Skipping file ${filename}: Unsupported file type ${fileExtension}`);
			continue; // Skip to the next file if not accepted
		}
		// Upload the image
		const image = path.join(IMAGE_DIR, filename);
		const imageReceipt = await irys.uploadFile(image);

		// Inject it into the metadata
		metadata.image = getImageBase() + imageReceipt.id;
		console.log(`image value  ${metadata.image}`);

		// Upload the metadata
		console.log(`Uploading metadata`);
		const jsonTags = [{ name: "Content-Type", value: "application/json" }];
		const metadataReceipt = await irys.upload(JSON.stringify(metadata), { tags: jsonTags });

		// Output the metadata
		const metadataName = path.basename(image, path.extname(image)) + ".json";
		const metadataPath = path.join(METADATA_DIR, metadataName);
		console.log(`metadata url  ${metadataPath}`);

		await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
		const metadataUrl = getMetadataBase() + metadataReceipt.id;

		entries.push({
			metadataName: filename.replace(fileExtension, ".json"),
			metadataUrl: metadataUrl,
		});
	}
	console.log("Upload and metadata generation complete.");

	await fs.writeFile(OUTPUT_JSON_PATH, JSON.stringify(entries, null, 2));
};

async function main(): Promise<void> {
	try {
		console.log(`Irys network: ${validatedEnv.IRYS_NETWORK}`);
		console.log(`Payment token: ${validatedEnv.IRYS_TOKEN}`);
		const irys = await getIrys();
		console.log(`Connected from ${irys.address}\n`);

		await uploadImagesAndUpdateMetadata();
	} catch (error) {
		console.error("An error occurred:", error);
	}
}

main();
