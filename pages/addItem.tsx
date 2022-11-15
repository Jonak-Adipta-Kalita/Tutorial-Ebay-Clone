import Head from "next/head";
import Header from "../components/Header";
import { useAddress, useContract } from "@thirdweb-dev/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";

type Props = {};

const AddItem = (props: Props) => {
  const { contract } = useContract(
    process.env.NEXT_PUBLIC_COLLECTION_CONTRACT,
    "nft-collection"
  );
  const address = useAddress();
  const router = useRouter();

  const [preview, setPreview] = useState<string>("");
  const [image, setImage] = useState<File>();

  const mintNFT = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!contract || !address) return;

    if (!image) {
      alert("Please select an Image");
      return;
    }

    const target = e.target as typeof e.target & {
      name: {
        value: string;
      };
      description: {
        value: string;
      };
    };

    const metadata = {
      name: target.name.value,
      description: target.description.value,
      image: image,
    };

    try {
      const transaction = await contract.mintTo(address, metadata);
      const receipt = transaction.receipt;
      const tokenId = transaction.id;
      const nft = await transaction.data();

      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <Head>
        <title>JAK Ebay Clone - Add Item</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="max-w-6xl mx-auto p-10 border">
        <h1 className="text-4xl font-bold">Add an Item to the Marketplace</h1>
        <h2 className="text-xl font-semibold pt-5">Item Details</h2>
        <p className="pb-5">
          By adding an Item to the marketplace, you're essentially Minting an
          NFT of the item into your wallet, which we can then list for sale!
        </p>
        <div className="flex flex-col justify-center items-center md:flex-row md:space-x-5 pt-5">
          <img
            src={preview || "https://links.papareact.com/ucj"}
            alt=""
            className="border h-80 w-80 object-contain"
          />
          <form
            onSubmit={mintNFT}
            className="flex flex-col flex-1 p-2 space-y-2"
          >
            <label className="font-light">Name of Item</label>
            <input
              className="formField"
              type="text"
              id="name"
              name="name"
              placeholder="Enter the Name of the Item"
            />
            <label className="font-light">Description</label>
            <input
              className="formField"
              type="text"
              id="description"
              name="description"
              placeholder="Enter the Description (Optional)"
            />
            <label className="font-light">Image of the Item</label>
            <input
              type="file"
              className="pb-10"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setPreview(URL.createObjectURL(e.target.files[0]));
                  setImage(e.target.files[0]);
                }
              }}
            />
            <button
              type="submit"
              className="bg-blue-600 font-bold text-white rounded-full py-4 px-10 w-56 md:mt-auto mx-auto mt-5 md:ml-auto"
            >
              Add/Mint Item
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddItem;
