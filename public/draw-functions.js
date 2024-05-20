class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }

  getCardPos() {
    return {
      PosX: this.value,
      PosY: this.suit,
    };
  }
}
class Diamond extends Card {
  constructor(value) {
    super(value, 1);
  }

  getCardPos() {
    return {
      PosX: this.value,
      PosY: this.suit,
    };
  }
}
class Heart extends Card {
  constructor(value) {
    super(value, 2);
  }

  getCardPos() {
    return {
      PosX: this.value,
      PosY: this.suit,
    };
  }
}
class Club extends Card {
  constructor(value) {
    super(value, 0);
  }

  getCardPos() {
    return {
      PosX: this.value,
      PosY: this.suit,
    };
  }
}
class Spade extends Card {
  constructor(value) {
    super(value, 3);
  }
  getCardPos() {
    return {
      PosX: this.value,
      PosY: this.suit,
    };
  }
}

function getKeyByValue(object, value) {
  for (let prop in object) {
    if (object.hasOwnProperty(prop)) {
      if (object[prop] === value) return prop;
    }
  }
}
export function cardToPos(card) {
  const conversionTable = {
    0: "A",
    1: "2",
    2: "3",
    3: "4",
    4: "5",
    5: "6",
    6: "7",
    7: "8",
    8: "9",
    9: "T",
    10: "J",
    11: "Q",
    12: "K",
  };
  let ans = getKeyByValue(conversionTable, card[0]);
  ans = Number(ans);
  let cardPos = null;
  if (card[1] === "d") {
    cardPos = new Diamond(ans);
  } else if (card[1] === "h") {
    cardPos = new Heart(ans);
  } else if (card[1] === "c") {
    cardPos = new Club(ans);
  } else if (card[1] === "s") {
    cardPos = new Spade(ans);
  }
  return cardPos.getCardPos();
}
export const tableCardsPos = [
  {
    x: 306,
    y: 225,
  },
  {
    x: 345,
    y: 225,
  },
  {
    x: 383,
    y: 225,
  },
  {
    x: 422,
    y: 225,
  },
  {
    x: 461,
    y: 225,
  },
];
