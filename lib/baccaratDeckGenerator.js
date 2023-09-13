function generateDeck() {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const values = ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"];
  const deck = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ value, suit });
    }
  }

  return deck;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function createShoe() {
  let shoe = [];
  for (let i = 0; i < 6; i++) {
    shoe = shoe.concat(generateDeck());
  }
  return shuffle(shoe);
}

function cardValue(card) {
  switch (card.value) {
    case "ace":
      return 1;
    case "jack":
    case "queen":
    case "king":
      return 10;
    default:
      return card.value;
  }
}

function handValue(hand) {
  return hand.reduce((acc, card) => acc + cardValue(card), 0) % 10;
}

function playBaccaratRound(shoe) {
  const playerHand = [shoe.pop(), shoe.pop()];
  const bankerHand = [shoe.pop(), shoe.pop()];

  const playerValue = handValue(playerHand);
  const bankerValue = handValue(bankerHand);

  let outcome;

  if (
    playerValue === 8 ||
    playerValue === 9 ||
    bankerValue === 8 ||
    bankerValue === 9
  ) {
    if (playerValue === bankerValue) {
      outcome = "tie";
    } else {
      outcome = playerValue > bankerValue ? "player" : "banker";
    }
  } else {
    let playerThirdCard = null;

    if (playerValue <= 5) {
      playerThirdCard = shoe.pop();
      playerHand.push(playerThirdCard);
    }

    const shouldBankerDraw = (playerThirdCard) => {
      if (bankerValue <= 2) return true;
      if (
        bankerValue === 3 &&
        (!playerThirdCard || playerThirdCard.value !== 8)
      )
        return true;
      if (
        bankerValue === 4 &&
        playerThirdCard &&
        playerThirdCard.value >= 2 &&
        playerThirdCard.value <= 7
      )
        return true;
      if (
        bankerValue === 5 &&
        playerThirdCard &&
        playerThirdCard.value >= 4 &&
        playerThirdCard.value <= 7
      )
        return true;
      if (
        bankerValue === 6 &&
        playerThirdCard &&
        (playerThirdCard.value === 6 || playerThirdCard.value === 7)
      )
        return true;
      return false;
    };

    if (shouldBankerDraw(playerThirdCard)) {
      bankerHand.push(shoe.pop());
    }

    const newPlayerValue = handValue(playerHand);
    const newBankerValue = handValue(bankerHand);

    if (newPlayerValue === newBankerValue) {
      outcome = "tie";
    } else {
      outcome = newPlayerValue > newBankerValue ? "player" : "banker";
    }
  }

  function generateRounds(shoe) {
    const rounds = [];

    // Play rounds until the shoe has reached the stopping point
    while (shoe.length >= 312 * 0.15) {
      rounds.push(playBaccaratRound(shoe));
    }

    return rounds;
  }

  return {
    outcome,
    playerHand,
    bankerHand,
  };
}

function cardImagePath(card) {
  const value = card.value === "ace" ? 1 : card.value;
  return `../cards/${value}_of_${card.suit}.svg`;
}
