import { currentRoleIndex } from "./game";
import { tempCardDeck } from "./game";
import { getRandomCard } from "./game-functions";

export function getRandomCard() {
  let randomIndex = Math.floor(Math.random() * tempCardDeck.length);
  let randomCard = tempCardDeck.splice(randomIndex, 1)[0];
  return randomCard;
}
export function assignRoles(table) {
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
export function emptyHands(table) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    tableSpot.hand = [];
  }
  return table;
}
export function dealCard(table) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.username != undefined) {
      tableSpot.hand.push(getRandomCard());
    }
  }
  return table;
}
export function getActivePlayersAmount(table) {
  let activePlayersAmount = 0;
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.gameStatus === "active") {
      activePlayersAmount++;
    }
  }
  return activePlayersAmount;
}
export function handleFold(user) {
  for (var i = 0; i < table.length; i++) {
    var tableSpot = table[i];
    if (tableSpot.username === user) {
      tableSpot.gameStatus = "folded";
    }
  }
}
