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

function getActivePlayersAmount(table) {
  let activePlayersAmount = 0;
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.gameStatus === "active") {
      activePlayersAmount++;
    }
  }
  return activePlayersAmount;
}
function sendBettingOption(table, index) {
  if (table[index].gameStatus === "active") {
    if (activePLayers > 0) {
      activePLayers - 1;
      socket.emit("bettingRoundAction", table[index].username, tableSpot.chips);
    } else if (activePLayers === 0) {
      //round finished
    }
  } else {
    index = (index + 1) % table.length;
    sendBettingOption(table, index);
  }
}

socket.on("bettingAction", (action) => {
  //get index here blet talbe också gobal maybe
  console.log(action);
  if (action === "fold") {
    handleFold(table[index].username);
    index = (index + 1) % table.length;
    sendBettingOption(index);
  } else if (action === "check") {
    index = (index + 1) % table.length;
    sendBettingOption(index);
  } else if (typeof action === Number) {
    activePLayers = getActivePlayersAmount(table); //reset shi so it do
    index = (index + 1) % table.length;
    sendBettingOption(table, index);
  }
});

function bettingRound(table) {
  let index = (currentRoleIndex + 2) % table.length;
  sendBettingOption(table, index);
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
  activePLayers = getActivePlayersAmount(table);
  table = bettingRound(table);

  //flop

  //betting round 2

  //turn

  //betting round 3

  //river

  //betting round 4

  //who won... payouts... start next round...
});
