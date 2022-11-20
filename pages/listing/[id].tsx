import { UserCircleIcon } from "@heroicons/react/24/solid";
import { MediaRenderer, useContract, useListing } from "@thirdweb-dev/react";
import { ListingType } from "@thirdweb-dev/sdk";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import Header from "../../components/Header";

type Props = { id: string };

const Listing = ({ id: listingId }: Props) => {
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );

  const { data: listing, error, isLoading } = useListing(contract, listingId);

  return (
    <div>
      <Head>
        <title>
          JAK Ebay Clone - Listing{" "}
          {isLoading
            ? "..."
            : listing
            ? `for ${listing?.asset.name}`
            : "not found!!"}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {isLoading ? (
        <p className="text-center animate-pulse text-blue-500">
          Loading Item!!
        </p>
      ) : !listing ? (
        <p className="text-center animate-pulse text-blue-500">
          Listing not found...
        </p>
      ) : (
        <main className="max-w-6xl mx-auto p-2 flex flex-col lg:flex-row space-y-10 space-x-5 pr-10">
          <div className="p-10 border mx-auto lg:mx-0 max-w-md lg:max-w-xl">
            <MediaRenderer src={listing?.asset.image} />
          </div>
          <section className="flex-1 space-y-5 pb-20 lg:pb-0">
            <div className="">
              <h1 className="text-xl font-bold">{listing.asset.name}</h1>
              <p className="text-gray-600">{listing.asset.description}</p>
              <p className="flex items-center text-xs sm:text-base">
                <UserCircleIcon className="h-5" />
                <span className="font-bold pr-1">Seller:</span>
                {listing.sellerAddress}
              </p>
            </div>
            <div className="grid grid-cols-2 items-center py-2">
              <p className="font-bold">Listing Type:</p>
              <p className="">
                {listing.type === ListingType.Direct
                  ? "Direct Listing"
                  : "Auction Listing"}
              </p>
              <p className="font-bold">Buy it Now Price: </p>
              <p className="text-4xl font-bold">
                {listing.buyoutCurrencyValuePerToken.displayValue}{" "}
                {listing.buyoutCurrencyValuePerToken.symbol}
              </p>
              <button className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10">
                Buy Now
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};

export default Listing;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      id: context.query.id,
    },
  };
};
