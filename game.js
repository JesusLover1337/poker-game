import { emptyHands } from "./game-functions";
import { handleFold } from "./game-functions";
import { getActivePlayersAmount } from "./game-functions";
import { dealCard } from "./game-functions";
import { assignRoles } from "./game-functions";

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
export let tempCardDeck = deck;

export let currentRoleIndex = 0;

function sendBettingOption(table, index) {
  if (table[index].gameStatus === "active") {
    if (activePLayers > 0) {
      activePLayers = activePLayers - 1;
      socket.emit("bettingRoundAction", table[index].username, tableSpot.chips);
    } else if (activePLayers === 0) {
      //round finished
      return table;
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
    sendBettingOption(table, index);
  } else if (action === "check") {
    index = (index + 1) % table.length;
    sendBettingOption(table, index);
  } else if (typeof action === Number) {
    activePLayers = getActivePlayersAmount(table); //reset shi so it do
    //action = amout betted set ting to other ting type shi
    index = (index + 1) % table.length;
    sendBettingOption(table, index);
  }
});

function bettingRound(table) {
  var index = (currentRoleIndex + 2) % table.length;
  let bettingRoundResults = sendBettingOption(table, index);
  return bettingRoundResults;
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
