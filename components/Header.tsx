import React from "react";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";

type Props = {};

const Header = ({}: Props) => {
  const connectWithMetamask = useMetamask();
  const disconnect = useDisconnect();
  const address = useAddress();

  return (
    <div className="">
      <nav className="">
        <div className="">
          <button
            onClick={address ? disconnect : connectWithMetamask}
            className="connectWalletBtn"
          >
            {address
              ? `Hi ${address.slice(0, 4)}...${address.slice(-4)}}`
              : "Connect your Wallet!!"}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Header;
