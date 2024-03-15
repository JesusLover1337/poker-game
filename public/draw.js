const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvas_width = (canvas.width = 800);
const canvas_height = (canvas.height = 500);
const cardDeck = document.getElementById("cardDeck");
const cardHeight = 74.5;
const cardWidth = 51.5;

//drawCard(cardToPos(card), {x:0,y:0});
function drawCard(pos, location) {
  ctx.drawImage(
    cardDeck,
    cardWidth * pos.PosX,
    cardHeight * pos.PosY,
    cardWidth,
    cardHeight,
    location.x,
    location.y,
    cardWidth / 1.5,
    cardHeight / 1.5
  );
}

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
function cardToPos(card) {
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
  ans = getKeyByValue(conversionTable, card[0]);
  ans = Number(ans);
  let cardPos = null;
  if (card[1] === "D") {
    // skriv om detta så det ser vettigt ut
    cardPos = new Diamond(ans);
  } else if (card[1] === "H") {
    cardPos = new Heart(ans);
  } else if (card[1] === "C") {
    cardPos = new Club(ans);
  } else if (card[1] === "S") {
    cardPos = new Spade(ans);
  }
  return cardPos.getCardPos();
}
