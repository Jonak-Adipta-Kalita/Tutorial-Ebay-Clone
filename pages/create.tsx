import {
  useAddress,
  useContract,
  MediaRenderer,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useCreateAuctionListing,
  useCreateDirectListing,
} from "@thirdweb-dev/react";
import { NFT, NATIVE_TOKENS, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import Header from "../components/Header";
import network from "../utils/network";

type Props = {};

const Create = ({}: Props) => {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const router = useRouter();
  const address = useAddress();
  const { contract: marketplaceContract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );
  const { contract: collectionContract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );
  const {
    mutate: createDirectListing,
    error: errorDirect,
    isLoading: isLoadingDirect,
  } = useCreateDirectListing(marketplaceContract);
  const {
    mutate: createAuctionListing,
    error: errorAuction,
    isLoading: isLoadingAuction,
  } = useCreateAuctionListing(marketplaceContract);
  const ownedNFTs = useOwnedNFTs(collectionContract, address);
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();

  const handleCreateListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!selectedNFT) return;

    const target = e.target as typeof e.target & {
      elements: {
        listingType: {
          value: "directListing" | "auctionListing";
        };
        price: {
          value: string;
        };
      };
    };

    const { listingType, price } = target.elements;

    if (listingType.value === "directListing") {
      createDirectListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNFT.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
        },
        {
          onSuccess(data, variables, context) {
            router.push("/");
          },
          onError(error, variables, context) {
            alert(error);
          },
        }
      );
    } else if (listingType.value === "auctionListing") {
      createAuctionListing(
        {
          assetContractAddress: process.env.NEXT_PUBLIC_COLLECTION_CONTRACT!,
          tokenId: selectedNFT.metadata.id,
          currencyContractAddress: NATIVE_TOKEN_ADDRESS,
          listingDurationInSeconds: 60 * 60 * 24 * 7,
          quantity: 1,
          buyoutPricePerToken: price.value,
          startTimestamp: new Date(),
          reservePricePerToken: 0,
        },
        {
          onSuccess(data, variables, context) {
            router.push("/");
          },
          onError(error, variables, context) {
            alert(error);
          },
        }
      );
    }
  };

  return (
    <div>
      <Head>
        <title>JAK Ebay Clone - Create a Listing</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="max-w-6xl mx-auto p-10 pt-2">
        <h1 className="text-xl font-semibold pt-5">List an Item</h1>
        <h2 className="">Select an Item you would like to sell.</h2>
        <hr className="mb-5" />
        <p className="">Below you will find the NFTs you own in your wallet</p>
        <div className="flex overflow-x-scroll space-x-2 p-4">
          {ownedNFTs?.data?.map((nft) => (
            <div
              key={nft.metadata.id}
              onClick={() => setSelectedNFT(nft)}
              className={`flex flex-col space-y-2 card min-w-fit border-2 bg-gray-100 ${
                selectedNFT?.metadata?.id === nft?.metadata?.id
                  ? "border-black"
                  : "border-transparent"
              }`}
            >
              <MediaRenderer
                src={nft.metadata.image}
                className="h-48 rounded-lg"
              />
              <p className="">{nft.metadata.name}</p>
              <p className="text-xs truncate font-bold">
                {nft.metadata.description}
              </p>
            </div>
          ))}
        </div>
        {selectedNFT && (
          <form onSubmit={handleCreateListing}>
            <div className="flex flex-col p-10">
              <div className="grid grid-cols-2 gap-5">
                <label className="border-r font-light">
                  Direct Listing/Fixed Price
                </label>
                <input
                  type="radio"
                  name="listingType"
                  value="directListing"
                  className="ml-auto h-10 w-10"
                />
                <label className="border-r font-light">Auction</label>
                <input
                  type="radio"
                  name="listingType"
                  value="auctionListing"
                  className="ml-auto h-10 w-10"
                />
                <label className="border-r font-light">Price</label>
                <input
                  type="text"
                  placeholder="0.05"
                  name="price"
                  className="bg-gray-100 p-5"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-4 mt-8"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Create;
