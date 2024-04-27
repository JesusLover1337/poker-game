let currentRoleIndex = 0;
const blinds = {
  SmallBlind: 20,
  BigBlind: 40,
  Dealer: 0,
};

const deck = [
  "2h",
  "3h",
  "4h",
  "5h",
  "6h",
  "7h",
  "8h",
  "9h",
  "Th",
  "Jh",
  "Qh",
  "Kh",
  "Ah",
  "2d",
  "3d",
  "4d",
  "5d",
  "6d",
  "7d",
  "8d",
  "9d",
  "Td",
  "Jd",
  "Qd",
  "Kd",
  "Ad",
  "2c",
  "3c",
  "4c",
  "5c",
  "6c",
  "7c",
  "8c",
  "9c",
  "Tc",
  "Jc",
  "Qc",
  "Kc",
  "Ac",
  "2s",
  "3s",
  "4s",
  "5s",
  "6s",
  "7s",
  "8s",
  "9s",
  "Ts",
  "Js",
  "Qs",
  "Ks",
  "As",
];
let tempCardDeck = deck;

function resetCarddeck() {
  tempCardDeck = deck;
}
function getRandomCard() {
  let randomIndex = Math.floor(Math.random() * tempCardDeck.length);
  let randomCard = tempCardDeck.splice(randomIndex, 1)[0];
  return randomCard;
}
function assignRoles(table, playerAmount) {
  const roles = ["SmallBlind", "BigBlind", "Dealer"];
  table.forEach((spot) => {
    spot.role = undefined;
  });
  for (let i = 0; i < roles.length; i++) {
    const playerIndex = (currentRoleIndex + i) % playerAmount;
    table[playerIndex].role = roles[i];
    table[playerIndex].bettedAmount = blinds[roles[i]];
    table[playerIndex].chips -= blinds[roles[i]];
  }
  currentRoleIndex = (currentRoleIndex + 1) % playerAmount;
  return table;
}
function getIndexofDealer(table) {
  const index =
    table.findIndex(
      (spot) => spot.role === "Dealer" && spot.gameStatus === "active"
    ) === -1
      ? table.findIndex((spot) => spot.gameStatus === "active")
      : table.findIndex(
          (spot) => spot.role === "Dealer" && spot.gameStatus === "active"
        );
  return index;
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
function handleFold(user, table) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.username === user) {
      tableSpot.gameStatus = "folded";
    }
  }
  return table;
}

function getActivePlayersHands(tableSpots) {
  return tableSpots
    .map((spot, index) => ({
      id: index,
      cards: spot.hand,
      isActive: spot.gameStatus === "active",
    }))
    .filter((spot) => spot.isActive)
    .map(({ id, cards }) => ({ id, cards }));
}

function handleresult(results, table) {
  let gamePot = 0;
  table.forEach((tableSpot) => {
    gamePot += tableSpot.bettedAmount;
  });
  let winners = results[0];
  winners.forEach((winner) => {
    table[winner.id].chips += gamePot / winners.length;
  });
  return table;
}

exports.handleFold = handleFold;
exports.emptyHands = emptyHands;
exports.getActivePlayersAmount = getActivePlayersAmount;
exports.assignRoles = assignRoles;
exports.dealCard = dealCard;
exports.getRandomCard = getRandomCard;
exports.getRandomCard = getRandomCard;
exports.getActivePlayersHands = getActivePlayersHands;
exports.resetCarddeck = resetCarddeck;
exports.getIndexofDealer = getIndexofDealer;
exports.handleresult = handleresult;
