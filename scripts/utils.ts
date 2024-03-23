import dotenv from "dotenv";
import Irys from "@irys/sdk";
dotenv.config();

interface IrysConfig {
	url: string;
	token: string;
	key: string;
	config: {
		providerUrl: string;
	};
}

const getIrys = async (): Promise<Irys> => {
	const url: string = process.env.NODE_URL || "";
	const token: string = process.env.TOKEN || "";
	const key: string = process.env.PRIVATE_KEY || "";
	const providerUrl: string = process.env.PROVIDER_URL || "";

	const irysConfig: IrysConfig = {
		url,
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
	const irysGateway: string = ensureTrailingSlash(process.env.IRYS_GATEWAY || "");
	const imageMutable: boolean = process.env.IMAGE_MUTABLE === "true";

	return imageMutable ? `${irysGateway}mutable/` : irysGateway;
};

const getMetadataBase = (): string | false => {
	const irysGateway: string = ensureTrailingSlash(process.env.IRYS_GATEWAY || "");
	const metadataMutable: boolean = process.env.METADATA_MUTABLE === "true";

	return metadataMutable ? `${irysGateway}mutable/` : irysGateway;
};

export { getIrys, getImageBase, getMetadataBase };
