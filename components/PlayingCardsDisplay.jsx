import React, { useEffect, useState, useMemo } from "react";
import styles from "../styles/Home.module.css";
import { ethers } from "ethers";

export default function PlayingCardsDisplay({
  event,
  blockNumberEvent,
  didWin,
  eventbetAmount,
  payOutAmount,
}) {
  console.log(
    `didwin:${didWin}, eventbetamount: ${eventbetAmount}, payoutamount:${payOutAmount}`
  );
  console.log(`event: ${event} && blocknumber: ${blockNumberEvent}`);
  const [shoe, setShoe] = useState([]);
  const [displayedCoup, setDisplayedCoup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shoeRound, setShoeRound] = useState(1);
  const [coupRound, setCoupRound] = useState(0);
  const totalCoups = 78; // Total number of coups in a shoe
  const [blockNumberCoup, setBlockNumberCoup] = useState(null);
  const [deckId, setDeckId] = useState("");
  const [cards, setCards] = useState([]);
  const [blockCoupMapping, setBlockCoupMapping] = useState({});

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      // Fetch deck
      const resDeck = await fetch(
        "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6"
      );
      const dataDeck = await resDeck.json();
      setDeckId(dataDeck.deck_id);

      // Fetch cards using the deckId from the fetched deck
      const resCards = await fetch(
        `https://deckofcardsapi.com/api/deck/${dataDeck.deck_id}/draw/?count=312`
      );
      const dataCards = await resCards.json();
      setCards(dataCards.cards);
      setLoading(false); // stop the loading after fetching the cards
    };

    fetchDeckAndCards();
  }, [shoeRound]);

  const getCardValue = (card) => {
    if (!card) {
      throw new Error("Card is undefined or null");
    }

    switch (card.value) {
      case "ACE":
        return 1;
      case "KING":
      case "QUEEN":
      case "JACK":
        return 0;
      default:
        return parseInt(card.value);
    }
  };

  const getShoe = async () => {
    setLoading(true);
    let shoe = [];

    for (let i = 0; i < cards.length; i += 4) {
      const playerCards = [cards[i], cards[i + 1]];
      const bankerCards = [cards[i + 2], cards[i + 3]];

      const playerTotal = calcSum(playerCards) % 10;
      const bankerTotal = calcSum(bankerCards) % 10;

      if (playerTotal >= 8 || bankerTotal >= 8) {
        const outcome = getCoupOutcome(playerTotal, bankerTotal);
        shoe.push({ playerCards, bankerCards, outcome });
        continue;
      }

      if (playerTotal <= 5 && cards.length > i + 4) {
        playerCards.push(cards[i + 4]);
      }

      const playerThirdCardValue = playerCards[2]
        ? getCardValue(playerCards[2])
        : 0;
      if (
        bankerTotal <= 2 ||
        (bankerTotal === 3 && playerThirdCardValue !== 8) ||
        (bankerTotal === 4 &&
          playerThirdCardValue >= 2 &&
          playerThirdCardValue <= 7) ||
        (bankerTotal === 5 &&
          playerThirdCardValue >= 4 &&
          playerThirdCardValue <= 7) ||
        (bankerTotal === 6 &&
          (playerThirdCardValue === 6 || playerThirdCardValue === 7) &&
          cards.length > i + 5)
      ) {
        bankerCards.push(cards[i + 5]);
      }

      const outcome = getCoupOutcome(
        calcSum(playerCards) % 10,
        calcSum(bankerCards) % 10
      );
      shoe.push({ playerCards, bankerCards, outcome });
    }

    setShoe(shoe);
    setLoading(false);
    // setShoeRound(shoeRound + 1);
  };

  const getCoupOutcome = (playerTotal, bankerTotal) => {
    if (playerTotal > bankerTotal) {
      return 1; // Player wins
    } else if (playerTotal < bankerTotal) {
      return 0; // Banker wins
    } else {
      return 2; // Tie
    }
  };

  const calcSum = (cards) =>
    cards.reduce((sum, card) => {
      if (card) {
        return sum + getCardValue(card);
      } else {
        return sum;
      }
    }, 0);

  useEffect(() => {
    if (cards.length) {
      getShoe();
    }
  }, [cards]);

  useEffect(() => {
    if (shoe.length && !blockCoupMapping[blockNumberEvent]) {
      const matchingCoupIndex = shoe.findIndex(
        (coup) => coup.outcome === event && blockNumberEvent !== blockNumberCoup
      );
      if (matchingCoupIndex !== -1) {
        const matchingCoup = shoe[matchingCoupIndex];
        setDisplayedCoup(matchingCoup);
        setBlockNumberCoup(blockNumberEvent);
        setShoe(shoe.filter((_, index) => index !== matchingCoupIndex));
        setCoupRound((prevCoupRound) => prevCoupRound + 1);

        // set the block number to coup mapping
        setBlockCoupMapping((prevMapping) => ({
          ...prevMapping,
          [blockNumberEvent]: matchingCoup,
        }));
      }
    }

    // Check if the shoe needs to be refreshed
    if (coupRound >= totalCoups * 0.7) {
      setShoeRound((prevShoeRound) => prevShoeRound + 1);
      setCoupRound(0); // Reset coupRound
    }
  }, [event, shoe, blockNumberEvent, coupRound]);

  // use useMemo to get the displayed coup
  const memoizedDisplayedCoup = useMemo(() => {
    // if blockCoupMapping has the block number, use that coup, otherwise, use displayedCoup
    return blockCoupMapping[blockNumberEvent] || displayedCoup;
  }, [blockCoupMapping, blockNumberEvent, displayedCoup]);

  useEffect(() => {
    if (displayedCoup) {
      setCoupRound((prevCoupRound) => prevCoupRound + 1);
    }
  }, [displayedCoup]);

  return (
    <div style={{ padding: "20px" }}>
      {loading && <p>Loading...</p>}
      {!loading &&
        memoizedDisplayedCoup &&
        memoizedDisplayedCoup.outcome === event && (
          <>
            {" "}
            <div className={styles.buttonsContainer}>
              <h2>第{`${shoeRound}.${coupRound}`}轮 </h2>
            </div>
            <div className={styles.buttonsContainer}>
              <h2>
                {didWin
                  ? `你赢：${ethers.utils.formatEther(payOutAmount)}`
                  : `你输：${ethers.utils.formatEther(eventbetAmount)}`}
              </h2>
            </div>
            <div className={styles.buttonsContainer}>
              <h2>
                {event === 0
                  ? "结果：庄赢"
                  : event === 1
                  ? "结果：闲赢"
                  : "结果：和"}
              </h2>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  overflowX: "auto",
                }}
              >
                <h3 style={{ marginRight: "10px" }}>闲:</h3>
                {memoizedDisplayedCoup.playerCards.map((card, i) => (
                  <img
                    key={i}
                    src={card.image}
                    alt={card.code}
                    style={{
                      width: "110px",
                      height: "auto",
                      marginRight: "2px",
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "nowrap",
                  overflowX: "auto",
                }}
              >
                <h3 style={{ marginRight: "10px" }}>庄:</h3>
                {memoizedDisplayedCoup.bankerCards.map((card, i) => (
                  <img
                    key={i}
                    src={card.image}
                    alt={card.code}
                    style={{
                      width: "110px",
                      height: "auto",
                      marginRight: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
    </div>
  );
}
