import type { TestContractAbi } from "@/sway-api";
import { TestContractAbi__factory } from "@/sway-api";
import contractIds from "@/sway-api/contract-ids.json";
import { bn } from "fuels";
import { useState } from "react";
import { Link } from "@/components/Link";
import { Button } from "@/components/Button";
import toast from "react-hot-toast";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import useAsync from "react-use/lib/useAsync";
import { Input } from "../components/Input";

const contractId = contractIds.tokenDeployerContract;

const hasContract = process.env.NEXT_PUBLIC_HAS_CONTRACT === "true";

export default function Home() {
  const { wallet, walletBalance, refreshWalletBalance } = useActiveWallet();
  const [contract, setContract] = useState<TestContractAbi>();
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [totalSupply, setTotalSupply] = useState<number>();

  /**
   * useAsync is a wrapper around useEffect that allows us to run asynchronous code
   * See: https://github.com/streamich/react-use/blob/master/docs/useAsync.md
   */
  useAsync(async () => {
    if (hasContract && wallet) {
      const testContract = TestContractAbi__factory.connect(contractId, wallet);
      setContract(testContract);
      const { value } = await testContract.functions.total_assets();
      setTotalSupply(value.toNumber());
    }
  }, [wallet]);

  // eslint-disable-next-line consistent-return
  const onSetNameAndToken = async () => {
    if (!contract) {
      return toast.error("Contract not loaded");
    }

    if (walletBalance?.eq(0)) {
      return toast.error(
        "Your wallet does not have enough funds. Please click the 'Top-up Wallet' button in the top right corner, or use the local faucet."
      );
    }

    const tx = await contract.functions.set_name(tokenName);
    await tx.wait();
    const tx2 = await contract.functions.set_symbol(tokenSymbol);
    await tx2.wait();

    await refreshWalletBalance?.();
  };

  return (
    <>
      <div className="flex gap-4 items-center">
        <h1 className="text-2xl font-semibold ali">Welcome to TokenCreator</h1>
      </div>
      <div>
        <h4 className="text-min"> There are a maximum of 100,000,000 coins for each asset that may be minted</h4>
      </div>

      {hasContract && (
        <>
          <div className="flex gap-4 items-left">
            <h2>Please Enter the Token name:</h2>
          </div>
          <Input
            className="w-full"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value ? e.target.value : undefined)}
            placeholder="name of token"
          />
          <div className="flex gap-4 items-left">
            <h2>Please Enter the Token Symbol:</h2>
          </div>
          <Input
            className="w-full"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value ? e.target.value : undefined)}
            placeholder="symbol of token"
          />

          <Button onClick={onSetNameAndToken} className="mt-6">
            Deploy Token
          </Button>
        </>
      )}

      <Link href="https://docs.fuel.network" target="_blank" className="mt-12">
        Fuel Docs
      </Link>
    </>
  );
}
