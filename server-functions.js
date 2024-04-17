/* function addPlayerToTable(player, id) {
  for (var i = 0; i < tableSpots.length; i++) {
    var tableSpot = tableSpots[i];
    if (tableSpot.username === undefined) {
      connectedUsers[id] = i;
      tableSpot.username = player.name;
      tableSpot.chips = player.chips;
      break;
    }
  }
}

function removePlayerFromTable(player) {
  for (var i = 0; i < tableSpots.length; i++) {
    var tableSpot = tableSpots[i];
    if (tableSpot.username === player) {
      tableSpot.username = undefined;
      // Update database with chip amount
      tableSpot.chips = undefined;
      console.log(tableSpots);
      break;
    }
  }
}
 */
