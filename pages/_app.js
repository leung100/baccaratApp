import {
  ThirdwebProvider,
  localWallet,
  metamaskWallet,
  smartWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import "../styles/globals.css";
import { API_KEY, FACTORY_ADDRESS } from "../constants/addresses";

// This is the chain your dApp will work on.
// Change this to the chain your app is built for.
// You can also import additional chains from `@thirdweb-dev/chains` and pass them directly.
const activeChain = "mumbai";

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebProvider
      activeChain={activeChain}
      // sdkOptions={{
      //   gasless: {
      //     openzeppelin: {
      //       relayerUrl:
      //         "https://api.defender.openzeppelin.com/autotasks/bc38470f-05a2-49fd-8149-f83047b9823d/runs/webhook/07295b21-ad2b-471c-b592-d5af25c94a54/GuSSYSJjh4cKb1opp7avx7",
      //     },
      //   },
      // }}
      supportedWallets={[
        metamaskWallet(),
        walletConnect(),
        localWallet(),
        smartWallet({
          factoryAddress: FACTORY_ADDRESS,
          thirdwebApiKey: API_KEY,
          gasless: false,
          personalWallets: [
            walletConnect(),
            metamaskWallet(),
            localWallet({ persist: true }),
          ],
        }),
      ]}
      clientId="a74ccc87840cdadea4af9cb22b790916"
    >
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;
