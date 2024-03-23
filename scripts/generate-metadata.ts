import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { getIrys, getImageBase, getMetadataBase } from "./utils";

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

const IMAGE_DIR = process.env.IMAGE_DIR || "./images";
const IRYS_GATEWAY = process.env.IRYS_GATEWAY || "https://gateway.irys.xyz";
const METADATA_DIR = process.env.METADATA_DIR || "./metadata";
const CSV_PATH = path.join(METADATA_DIR, "metadata.csv");
const ACCEPTED_IMAGE_TYPES = (process.env.ACCEPTED_IMAGE_TYPES || "").split(",");

const parseAttributes = (attributesJson: string): Attribute[] => {
	try {
		return JSON.parse(attributesJson);
	} catch (e) {
		console.error("Error parsing attributes:", e);
		return [];
	}
};

const metadata: NFTMetadata = {
	name: process.env.NAME || "",
	description: process.env.DESCRIPTION || "",
	image: "", // This will be set after uploading to Irys
	external_url: process.env.EXTERNAL_URL,
	background_color: process.env.BACKGROUND_COLOR,
	animation_url: process.env.ANIMATION_URL,
	attributes: parseAttributes(process.env.ATTRIBUTES || "[]"),
};

const uploadImagesAndUpdateMetadata = async (): Promise<void> => {
	const irys = await getIrys();
	const imageFiles = await fs.readdir(IMAGE_DIR);

	// Ensure the metadata directory exists
	await fs.mkdir(METADATA_DIR, { recursive: true });

	// Check if metadata.csv exists; if not, create it and write the headers
	try {
		await fs.access(CSV_PATH);
	} catch (error) {
		await fs.writeFile(CSV_PATH, "metadataName,metadataUrl\n", { flag: "wx" });
	}

	for (const filename of imageFiles) {
		const fileExtension = path.extname(filename).toLowerCase();

		// Check if the file extension is in the list of accepted image types
		if (!ACCEPTED_IMAGE_TYPES.includes(fileExtension)) {
			console.log(`Skipping file ${filename}: Unsupported file type ${fileExtension}`);
			continue; // Skip to the next file if not accepted
		}
		// Upload the image
		console.log(`Uploading ${path.join(IMAGE_DIR, filename)}`);
		const image = path.join(IMAGE_DIR, filename);
		const imageReceipt = await irys.uploadFile(image);

		// Inject it into the metadata
		metadata.image = getImageBase() + imageReceipt.id;

		// Upload the metadata
		console.log(`Uploading metadata`);
		const tags = [{ name: "Content-Type", value: "application/json" }];
		const metadataReceipt = await irys.upload(JSON.stringify(metadata), { tags });

		// Output the metadata
		const metadataName = path.basename(image, path.extname(image)) + ".json";
		const metadataPath = path.join(METADATA_DIR, metadataName);
		await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

		// Log the metadata and URL
		const metadataUrl = getMetadataBase() + metadataReceipt.id;
		const csvLine = `${metadataName},${metadataUrl}\n`;
		await fs.writeFile(CSV_PATH, csvLine, { flag: "a" });
	}
};

uploadImagesAndUpdateMetadata().then(() => console.log("Upload and metadata generation complete."));
