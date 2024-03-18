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

let currentRoleIndex = 0;

function assignRoles(table) {
  const roles = ["SmallBlind", "BigBlind", "Dealer"];

  table.forEach((spot) => {
    spot.role = undefined;
  });

  for (let i = 0; i < roles.length; i++) {
    const playerIndex = (currentRoleIndex + i) % table.length;
    table[playerIndex].role = roles[i];
  }

  currentRoleIndex = (currentRoleIndex + 1) % table.length;

  return table;
}

function emptyHands(table) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    tableSpot.hand = [];
  }
  return table;
}
function dealCard(table) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.username != undefined) {
      tableSpot.hand.push(getRandomCard());
    }
  }
  return table;
}

function handleFold(user) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.username === user) {
      tableSpot.gameStatus = "folded";
    }
  }
}

function handleRaise(user, amount) {}

function bettingRound(table) {
  /* for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.gameStatus === "active") {
      socket.emit("bettingRoundAction", tableSpot.username, tableSpot.chips);
      function handleBettingAction(action) {
        console.log(action);
        if (action === "fold") {
          handleFold(tableSpot.username);
        } else if (action === "check") {
          // Handle check
        } else if (typeof action === "number") {
          handleRaise(tableSpot.username, action);
        }
      }
      socket.on("bettingAction", handleBettingAction);
    }
  } */
  /* for (var tableKey in table) {
    var tableSpot = table[tableKey];
    if (tableSpot.gameStatus === "active") {
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
  } */
}

socket.on("roundStart", (table) => {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    tableSpot.gameStatus = "active";
  }

  table = assignRoles(table);
  table = emptyHands(table);
  tempCardDeck = deck;
  table = dealCard(table);
  table = dealCard(table);
  //betting round 1
  table = bettingRound(table);

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
