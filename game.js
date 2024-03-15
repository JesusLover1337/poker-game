var socket = io();
const deck = [
  "2H",
  "3H",
  "4H",
  "5H",
  "6H",
  "7H",
  "8H",
  "9H",
  "TH",
  "JH",
  "QH",
  "KH",
  "AH",
  "2D",
  "3D",
  "4D",
  "5D",
  "6D",
  "7D",
  "8D",
  "9D",
  "TD",
  "JD",
  "QD",
  "KD",
  "AD",
  "2C",
  "3C",
  "4C",
  "5C",
  "6C",
  "7C",
  "8C",
  "9C",
  "TC",
  "JC",
  "QC",
  "KC",
  "AC",
  "2S",
  "3S",
  "4S",
  "5S",
  "6S",
  "7S",
  "8S",
  "9S",
  "TS",
  "JS",
  "QS",
  "KS",
  "AS",
];
let tempCardDeck = deck;

function getRandomCard() {
  let randomIndex = Math.floor(Math.random() * tempCardDeck.length);
  let randomCard = tempCardDeck.splice(randomIndex, 1)[0];
  return randomCard;
}
function emptyHands(table) {
  for (var tableKey in table) {
    var tableSpot = table[tableKey];
    tableSpot.hand = [];
  }
}
function dealCard(table) {
  for (var tableKey in table) {
    var tableSpot = table[tableKey];
    if (tableSpot.username != undefined) {
      tableSpot.hand.push(getRandomCard());
    }
  }
}

socket.on("roundStart", (table) => {
  emptyHands(table);
  tempCardDeck = deck;
  dealCard(table);
  dealCard(table);
  //betting round 1
  socket.emit("bettingRoundAction");
  /* 
emit to client (ask for aciton)
måste vara seperat (en i taget kanske ha socket id i table)

*/
  //flop

  //betting round 2

  //turn

  //betting round 3

  //river

  //betting round 4

  //who won... payouts... start next round...
});
