import { UserCircleIcon } from "@heroicons/react/24/solid";
import {
  MediaRenderer,
  useContract,
  useListing,
  useNetwork,
  useNetworkMismatch,
  useMakeBid,
  useOffers,
  useMakeOffer,
  useBuyNow,
  useAddress,
  useAcceptDirectListingOffer,
} from "@thirdweb-dev/react";
import { ListingType, NATIVE_TOKENS } from "@thirdweb-dev/sdk";
import { BigNumber, ethers } from "ethers";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Countdown from "react-countdown";
import network from "../../utils/network";
import { useRouter } from "next/router";

type Props = { id: string };

const Listing = ({ id: listingId }: Props) => {
  const [minimumNextBid, setMinimumNextBid] = useState<{
    symbol: string;
    value: BigNumber;
    name: string;
    decimals: number;
    displayValue: string;
  }>();
  const [bidAmount, setBidAmount] = useState<string>("");
  const address = useAddress();
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT,
    "marketplace"
  );
  const { mutate: buyNow } = useBuyNow(contract);
  const { mutate: makeOffer } = useMakeOffer(contract);
  const offers = useOffers(contract, listingId);
  const { mutate: makeBid } = useMakeBid(contract);
  const { mutate: acceptOffer } = useAcceptDirectListingOffer(contract);
  const networkMismatch = useNetworkMismatch();
  const [, switchNetwork] = useNetwork();
  const router = useRouter();

  const { data: listing, error, isLoading } = useListing(contract, listingId);

  const formatPlaceholder = () => {
    if (isLoading || !listing) return "Loading...";

    if (listing.type === ListingType.Direct) {
      return "Enter offer Amout";
    } else if (listing.type === ListingType.Auction) {
      return Number(minimumNextBid?.displayValue) === 0
        ? "Enter Bid Amount"
        : `${minimumNextBid?.displayValue} ${minimumNextBid?.symbol} or more`;
    }
  };

  const fetchMinNextBid = async () => {
    if (!listingId || !contract) return;

    setMinimumNextBid(await contract.auction.getMinimumNextBid(listingId));
  };

  const buyNFT = async () => {
    if (networkMismatch) {
      switchNetwork && switchNetwork(network);
      return;
    }

    if (!listingId || !contract || !listing) return;

    await buyNow(
      { id: listingId, buyAmount: 1, type: listing.type },
      {
        onSuccess(data, variables, context) {
          alert("NFT bought successfully!!");
          router.replace("/");
        },
        onError(error, variables, context) {
          alert("Error: NFT could not be bought!!");
        },
      }
    );
  };

  const createOfferOrBid = async () => {
    try {
      if (networkMismatch) {
        switchNetwork && switchNetwork(network);
        return;
      }

      if (listing?.type === ListingType.Direct) {
        if (
          listing.buyoutPrice.toString() ===
          ethers.utils.parseEther(bidAmount).toString()
        ) {
          buyNFT();
          return;
        }
        await makeOffer(
          { listingId, quantity: 1, pricePerToken: bidAmount },
          {
            onSuccess(data, variables, context) {
              alert("Offer made successfully!!");
              setBidAmount("");
            },
            onError(error, variables, context) {
              alert("Error: Offer could not be made!!");
            },
          }
        );
      } else if (listing?.type === ListingType.Auction) {
        await makeBid(
          { listingId, bid: bidAmount },
          {
            onSuccess(data, variables, context) {
              alert("Bid made successfully!!");
              setBidAmount("");
            },
            onError(error, variables, context) {
              alert("Error: Bid could not be made!!");
            },
          }
        );
      }
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    if (!listingId || !contract || !listing) return;

    if (listing.type === ListingType.Auction) {
      fetchMinNextBid();
    }
  }, [listing, listingId, contract]);

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
              <button
                onClick={buyNFT}
                className="col-start-2 mt-2 bg-blue-600 font-bold text-white rounded-full w-44 py-4 px-10"
              >
                Buy Now
              </button>
            </div>
            {listing.type === ListingType.Direct && offers && (
              <div className="grid grid-cols-2 gap-y-2">
                <p className="font-bold">Offers: </p>
                <p className="font-bold">{offers?.data?.length}</p>
                {offers?.data?.map((offer) => (
                  <>
                    <p
                      key={
                        offer.listingId +
                        offer.offeror +
                        offer.totalOfferAmount.toString()
                      }
                      className="flex items-center ml-5 text-sm italic"
                    >
                      <UserCircleIcon className="h-3 mr-2" />
                      {offer.offeror.slice(0, 5) +
                        "..." +
                        offer.offeror.slice(-5)}
                    </p>
                    <div className="">
                      <p className="text-sm italic">
                        {ethers.utils.formatEther(offer.totalOfferAmount)}{" "}
                        {NATIVE_TOKENS[network].symbol}
                      </p>
                      {listing.sellerAddress === address && (
                        <button
                          className="p-2 w-32 bg-red-500/50 rounded-lg font-bold text-xs cursor-pointer"
                          onClick={() =>
                            acceptOffer(
                              {
                                addressOfOfferor: offer.offeror,
                                listingId,
                              },
                              {
                                onSuccess(data, variables, context) {
                                  alert("Offer accepted successfull!!");
                                  router.replace("/");
                                },
                                onError(error, variables, context) {
                                  alert("Offer could not be accepted!!");
                                },
                              }
                            )
                          }
                        >
                          Accept Offer
                        </button>
                      )}
                    </div>
                  </>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 space-y-2 items-center justify-end">
              <hr className="col-span-2" />
              <p className="col-span-2 font-bold">
                {listing.type === ListingType.Direct
                  ? "Make an Offer"
                  : "Bid on this Auction"}
              </p>
              {listing.type === ListingType.Auction && (
                <>
                  <p>Current Minimum Bid: </p>
                  <p>
                    {minimumNextBid?.displayValue} {minimumNextBid?.symbol}
                  </p>
                  <p>Time Remaining: </p>
                  <Countdown
                    date={
                      Number(listing.endTimeInEpochSeconds.toString()) * 1000
                    }
                  />
                </>
              )}
              <input
                className="border p-2 rounded-lg mr-5 outline-none"
                type="text"
                placeholder={formatPlaceholder()}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <button
                onClick={createOfferOrBid}
                className="bg-red-600 font-bold text-white rounded-full w-44 py-4 px-10"
              >
                {listing.type === ListingType.Direct ? "Offer" : "Bid"}
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
