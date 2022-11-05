import React from "react";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import Link from "next/link";
import {
  BellIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type Props = {};

const Header = ({}: Props) => {
  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();
  const address = useAddress();

  return (
    <div className="">
      <nav className="flex justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={address ? disconnect : connectWithMetamask}
            className="connectWalletBtn"
          >
            {address
              ? `Hi ${address.slice(0, 4)}...${address.slice(-4)}}`
              : "Connect your Wallet!!"}
          </button>
          <p className="navLink">Daily Deals</p>
          <p className="navLink">Help & Contact</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <p className="navLink">Ship to</p>
          <p className="navLink">Sell</p>
          <p className="navLink">Watchlist</p>
          <Link href="/addItem" className="flex items-center hover:link">
            Add to Inventory <ChevronDownIcon className="h-4" />
          </Link>
          <BellIcon className="h-6 w-6 cursor-pointer" />
          <ShoppingCartIcon className="h-6 w-6 cursor-pointer" />
        </div>
      </nav>
    </div>
  );
};

export default Header;
