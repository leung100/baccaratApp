import {
  ConnectWallet,
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useContractEvents,
} from "@thirdweb-dev/react";

import styles from "../styles/Home.module.css";
import { CONTRACT_ADDRESS } from "../constants/addresses";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import PlayingCardsDisplay from "../components/PlayingCardsDisplay";

const Home = () => {
  const address = useAddress();

  const { contract } = useContract(CONTRACT_ADDRESS);

  const { data: betResultEvent } = useContractEvents(
    contract,
    "BetResult", // Event name being emitted by your smart contract
    {
      subscribe: true,

      // Subscribe to new events
    }
  );
  const [result, setResult] = useState(undefined);
  const [blockNumber, setBlockNumber] = useState(undefined);

  useEffect(() => {
    if (betResultEvent && betResultEvent.length) {
      const latestBetResult = betResultEvent[0];
      setResult(latestBetResult.data.result);
      setBlockNumber(latestBetResult.data.blockNumber);
    }
  }, [betResultEvent]); // re-run the effect when betResultEvent changes

  const {
    data: betOutComeEvent,
    isLoading,
    error,
  } = useContractEvents(
    contract,
    "BetOutcome", // Event name being emitted by your smart contract
    {
      subscribe: true, // Subscribe to new events
    }
  );

  const [didWin, setDidWin] = useState(undefined);
  const [eventbetAmount, setEventBetAmount] = useState(0);
  const [payOutAmount, setPayOutAmount] = useState(0);

  useEffect(() => {
    if (betOutComeEvent && betOutComeEvent.length) {
      const latestBetOutcomeEvent = betOutComeEvent[0];
      // console.log(latestBetOutcomeEvent);
      setDidWin(latestBetOutcomeEvent.data.didWin);
      setEventBetAmount(latestBetOutcomeEvent.data.betAmount);
      setPayOutAmount(latestBetOutcomeEvent.data.payoutAmount);
    }
  }, [betOutComeEvent]);

  const { data: balanceOfPlayerStaked, isLoading: loadingBalancePlayerStaked } =
    useContractRead(contract, "getStakerBalance", [address]);

  console.log(balanceOfPlayerStaked);

  let etherValueOfPlayerStaked = "";

  if (balanceOfPlayerStaked !== undefined) {
    if (ethers.BigNumber.isBigNumber(balanceOfPlayerStaked)) {
      let bigNumber = ethers.BigNumber.from(balanceOfPlayerStaked._hex);
      etherValueOfPlayerStaked = ethers.utils.formatEther(bigNumber);
    } else {
      // Here you might want to handle the case where balanceOfHouse is not a BigNumber
      // For example, if it's already a string you could just assign it directly:
      etherValueOfPlayerStaked = balanceOfPlayerStaked;
    }
  }

  const { data: balanceOfHouse, isLoading: loadingBalanceOfHouse } =
    useContractRead(contract, "getHouseStake");

  let etherValue = "";

  if (balanceOfHouse !== undefined) {
    if (ethers.BigNumber.isBigNumber(balanceOfHouse)) {
      let bigNumber = ethers.BigNumber.from(balanceOfHouse._hex);
      etherValue = ethers.utils.formatEther(bigNumber);
    } else {
      etherValue = balanceOfHouse;
    }
  }

  let percentageOfStaker = (etherValueOfPlayerStaked / etherValue) * 100;

  const [stakeInput, setStakeInput] = useState("");
  const handleStakeInput = (event) => {
    setStakeInput(event.target.value);
  };

  const [betAmount, setBetAmount] = useState("");
  const handleBetAmount = (event) => {
    setBetAmount(event.target.value);
  };

  const [withdrawInput, setWithdrawInput] = useState("");
  const handleWithdraw = (event) => {
    setWithdrawInput(event.target.value);
  };

  return (
    <div className={styles.container}>
      <div>
        <div>
          {address ? (
            <>
              <ConnectWallet />

              <main className={styles.main}>
                <div>
                  <PlayingCardsDisplay
                    event={result}
                    blockNumberEvent={blockNumber}
                    didWin={didWin}
                    eventbetAmount={eventbetAmount}
                    payOutAmount={payOutAmount}
                  />
                  <div className={styles.buttonsContainer}>
                    <input
                      type="text"
                      value={betAmount}
                      onChange={handleBetAmount}
                      placeholder="请输入投注金额"
                      style={{ height: "30px" }}
                    />
                  </div>
                  <div className={styles.buttonsContainer}>
                    <Web3Button
                      contractAddress={CONTRACT_ADDRESS}
                      action={(contract) =>
                        contract.call("placeBet", [0], {
                          value: ethers.utils.parseEther(betAmount),
                        })
                      }
                      onSuccess={() => alert(`投注成功：${betAmount}`)}
                      onError={(error) => alert("投注失败")}
                    >
                      庄
                    </Web3Button>
                    {"  "}
                    <Web3Button
                      contractAddress={CONTRACT_ADDRESS}
                      action={(contract) =>
                        contract.call("placeBet", [1], {
                          value: ethers.utils.parseEther(betAmount),
                        })
                      }
                      onSuccess={() => alert(`投注成功：${betAmount}`)}
                      onError={(error) => alert("投注失败")}
                    >
                      闲
                    </Web3Button>
                    {"  "}
                    <Web3Button
                      contractAddress={CONTRACT_ADDRESS}
                      action={(contract) =>
                        contract.call("placeBet", [2], {
                          value: ethers.utils.parseEther(betAmount),
                        })
                      }
                      onSuccess={() => alert(`投注成功：${betAmount}`)}
                      onError={(error) => alert("投注失败")}
                    >
                      和
                    </Web3Button>{" "}
                  </div>
                </div>
                <div className={styles.displayPoolInfo}>
                  <a
                    href="https://mumbai.polygonscan.com/address/0x1D4ac734e1908D5e4f4b9b4927487B73087f3bf6"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="点击查看余额"
                  >
                    <div>{`资金池总额：${etherValue}`}</div>
                  </a>
                  <div>
                    <a
                      href="https://mumbai.polygonscan.com/address/0x1D4ac734e1908D5e4f4b9b4927487B73087f3bf6#readContract#F4"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="点击查看余额，输入钱包地址"
                    >
                      <div>{`你个人资金池余额： ${etherValueOfPlayerStaked}`}</div>
                      <div>
                        {`你个人资金池比例： ${percentageOfStaker.toFixed(2)}`}%{" "}
                      </div>
                    </a>{" "}
                    <Web3Button
                      contractAddress={CONTRACT_ADDRESS}
                      action={(contract) =>
                        contract.call("stake", [], {
                          value: ethers.utils.parseEther(stakeInput),
                        })
                      }
                      onSuccess={() => alert(`投资成功：${stakeInput}`)}
                      onError={(error) => alert(`投资失败：${stakeInput} `)}
                    >
                      投资资金池
                    </Web3Button>{" "}
                    <input
                      type="text"
                      value={stakeInput}
                      onChange={handleStakeInput}
                      placeholder="请输入金额"
                      style={{ width: "50px", height: "30px" }}
                    />
                    <Web3Button
                      contractAddress={CONTRACT_ADDRESS}
                      action={(contract) =>
                        contract.call("withdrawStake", [
                          ethers.utils.parseEther(withdrawInput),
                        ])
                      }
                      onSuccess={() => alert(`撤出成功: ${withdrawInput}`)}
                      onError={(error) => alert(`撤出失败: ${withdrawInput}`)}
                    >
                      从资金池撤出
                    </Web3Button>{" "}
                    <input
                      type="text"
                      value={withdrawInput}
                      onChange={handleWithdraw}
                      placeholder="请输入金额"
                      style={{ width: "50px", height: "30px" }}
                    />
                  </div>
                </div>
              </main>
            </>
          ) : (
            <ConnectWallet btnTitle="登入钱包" modalTitle="请选择登入方式" />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
