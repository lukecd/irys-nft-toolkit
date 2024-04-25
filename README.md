# Irys NFT Toolkit

A simple CLI for NFT builders.

## Overview

NFTs are minted using metadata that includes a link to the NFT image along with details describing the collection. When minting an NFT you (generally) provide a URL to the metadata file.

A smart contract tracks NFT ownership and is permanent and immutable. However, this doesn't mean the NFT itself is immutable. When NFT assets are stored on cloud providers or peer-to-peer networks (like IPFS), there's no guarantee of permanence. To guarantee permanence, you need to store your NFTs on a blockchain like Arweave. When you [use Irys to upload your NFTs to Arweave](https://irys.xyz/use-cases/nfts), you can [pay for storage in most tokens](https://docs.irys.xyz/overview/supported-tokens), and your transaction is guaranteed to be finalized and seeded to multiple reputable miners.

This toolkit is a simple CLI to make [uploading NFTs to Irys even easier](https://docs.irys.xyz/hands-on/tutorials/uploading-nfts).

## Metadata

[NFT metadata](https://docs.opensea.io/docs/metadata-standards) contains the NFT name, symbol, description, unique attributes and other things.

Define your project's metadata in the [`.env`](https://github.com/lukecd/irys-nft-toolkit/blob/main/.env.example) file.

## Setup

Rename `.env.example` to `.env` and fill in with your private key and NFT metadata. Your private key will be used to pay for uploads to Irys and interact with the contract.

## Commands

- `npm run metadata`

1. Permanently uploads images to Irys
2. Generates metadata files
3. Permanently uploads metadata files to Irys
4. Exports metadata files
5. Exports a JSON file containing URLs for each metadata file

The output of this command can then be used to manually mint NFTs, or as input to:

- `npm run mint721 [metadata-file]`

1. Mints NFTs using the metadata URLs in metadata-file

If using this command, you must first deploy a contract that implements the function `mint721` and include the contract address in the `.env` fie. The [ThirdWeb NFT Collection](https://portal.thirdweb.com/contracts/explore/pre-built-contracts/nft-collection) will work.
