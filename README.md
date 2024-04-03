# Irys NFT Toolkit

## Setup

Rename `.env.example` to `.env` and fill in with your private key and NFT metadata. Your private key will be used to pay for uploads to Irys and interact with the contract.

## Commands

- `npm run metadata`

1. Uploads images to Irys
2. Generates metadata files
3. Uploads metadata files
4. Exports metadata files
5. Exports a JSON file containing URLs for each metadata file

- `npm run mint721 [metadata-file]`

1. Mints NFTs using the metadata URLs in metadata-file
