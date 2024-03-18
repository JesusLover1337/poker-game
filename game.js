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

function handleFold(user) {}

function handleRaise(user, amount) {}

async function bettingRound(table) {
  for (var tableKey in table) {
    var tableSpot = table[tableKey];
    socket.emit("bettingRoundAction", tableSpot.username, tableSpot.chips);
    var result = await new Promise((resolve) => {
      socket.on("bettingAction", (action) => {
        resolve(action);
      });
    });
    console.log(result);
    if (result === "fold") {
      handleFold(tableSpot.username);
    } else if (result === "check") {
      //check
    } else if (typeof result === Number) {
      handleRaise(tableSpot.username, result);
    }
  }
}

socket.on("roundStart", (table) => {
  emptyHands(table);
  tempCardDeck = deck;
  dealCard(table);
  dealCard(table);
  //betting round 1
  bettingRound(table);

  /* 
emit to client (ask for aciton)
for in table emit(username)
client side if palyer === username {
    ask for aciton
}
if action === raise {
    bombacalt gör nåt coolt
}
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
