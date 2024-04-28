var mysql = require("mysql");
const express = require("express");
const Ranker = require("handranker-latest");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { tableSpots } = require("./tableSpots");
const io = new Server(server);
const {
  emptyHands,
  handleFold,
  getActivePlayersAmount,
  dealCard,
  assignRoles,
  getRandomCard,
  getActivePlayersHands,
  resetCarddeck,
  getIndexofDealer,
  handleresult,
} = require("./game-functions");
const {} = require("./server-functions");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pokergame",
});

app.use("/public", express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});

con.connect(function (err) {
  if (err) throw err;
});

var tempTableSpots = tableSpots;
var connectedUsers = {};
let activePLayers;
let roundsPlayed;
let board = [];
let currentBetAmount;
const roundNames = ["flop", "turn", "river"];
function addPlayerToTable(player, id) {
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
      console.log(tableSpot);
      var sql = `UPDATE acounts SET chips = '${tableSpot.chips}' WHERE name = '${tableSpot.username}'`;
      con.query(sql, function (err, result) {
        if (err) throw err;
      });
      tableSpot.chips = undefined;
      tableSpot.username = undefined;
      tableSpot.gameStatus = "folded";
      break;
    }
  }
}

function addAcount(name, email, password, chips) {
  var sql = `INSERT INTO acounts (name, email, password, chips) VALUES ('${name}', '${email}', '${password}', '${chips}')`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Account added successfully!");
  });
}

io.on("connection", (socket) => {
  socket.on("login", (username, password) => {
    if (!username) username = undefined;
    if (!password) password = undefined;
    con.query("SELECT * FROM acounts", function (err, results, fields) {
      if (err) throw err;
      results.forEach((account) => {
        if (username === account.name && password === account.password) {
          loginSuccess = true;
          console.log("user exists");
          addPlayerToTable(account, socket.id);
          socket.emit(
            "loginsuccess",
            account.name,
            Object.keys(connectedUsers).length
          );
        }
      });
    });
  });
  socket.on("signup", (username, email, password) => {
    var startingchips = 10000;
    var uniqueName = true;
    con.query("SELECT * FROM acounts", function (err, results, fields) {
      if (err) throw err;
      results.forEach((account) => {
        console.log(account.name);
        if (username === account.name) {
          uniqueName = false;
        }
      });
      if (uniqueName) {
        addAcount(username, email, password, startingchips);
        socket.emit("signinsuccess", account.name);
      } else {
        console.log("name already exist");
      }
    });
  });
  socket.on("logout", (player) => {
    removePlayerFromTable(player);
    delete connectedUsers[socket.id];
  });

  function sendBettingOption(table, index) {
    if (getActivePlayersAmount(tempTableSpots) === 1) {
      let winnerIndex = table.findIndex((spot) => spot.gameStatus === "active");
      tempTableSpots = handleresult([[{ id: winnerIndex }]], tempTableSpots);
      io.emit("drawTableX", null, null, table[index].username);
    } else if (table[index].gameStatus === "active") {
      if (activePLayers > 0) {
        activePLayers = activePLayers - 1;
        io.emit(
          "bettingRoundAction",
          table[index].username,
          table[index].chips,
          table[index].bettedAmount,
          currentBetAmount
        );
      } else if (activePLayers === 0) {
        if (roundsPlayed === 3) {
          console.log("game finish");
          let hands = getActivePlayersHands(tempTableSpots);
          var results = Ranker.orderHands(hands, board);
          console.log(results);
          tempTableSpots = handleresult(results, tempTableSpots);
        }
        const cardsToShow =
          roundsPlayed === 0
            ? [getRandomCard(), getRandomCard(), getRandomCard()]
            : [getRandomCard()];
        cardsToShow.forEach((card) => {
          board.push(card);
        });
        io.emit(
          "drawTableX",
          roundNames[roundsPlayed],
          cardsToShow,
          table[index].username
        );
        activePLayers = getActivePlayersAmount(tempTableSpots);
        roundsPlayed++;
        if (roundsPlayed <= 3) {
          bettingRound(tempTableSpots);
        }
      }
    } else {
      index = (index + 1) % table.length;
      sendBettingOption(table, index);
    }
  }
  function bettingRound(table) {
    //kan läggas i game-funcs
    var index = getIndexofDealer(table);
    sendBettingOption(table, index);
  }

  socket.on("bettingAction", (action) => {
    //kanske tabort elseif elseif elsif
    /* 
    function example() {
  return condition1 ? value1
    : condition2 ? value2
    : condition3 ? value3
    : value4;
}
//
function example() {
  if (condition1) {
    return value1;
  } else if (condition2) {
    return value2;
  } else if (condition3) {
    return value3;
  } else {
    return value4;
  }
}   
    */
    let index = connectedUsers[socket.id];
    if (action === "fold") {
      tempTableSpots = handleFold(
        tempTableSpots[index].username,
        tempTableSpots
      );
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    } else if (action === "check") {
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    } else if (action[0] === "call") {
      let amount = Number(action[1]);
      tempTableSpots[index].chips -= amount;
      tempTableSpots[index].bettedAmount += amount;
      currentBetAmount = tempTableSpots[index].bettedAmount;
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    } else if (action[0] === "raise") {
      let amount = Number(action[1]);
      tempTableSpots[index].chips -= amount;
      activePLayers = getActivePlayersAmount(tempTableSpots) - 1;
      tempTableSpots[index].bettedAmount += amount;
      currentBetAmount = tempTableSpots[index].bettedAmount;
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    }
  });

  socket.on("roundStart", () => {
    /* io.emit("drawAllProfiles", data); */
    //check if 3 players
    //check if broke
    currentBetAmount = 40;
    let = board = [];
    resetCarddeck();
    roundsPlayed = 0;
    tempTableSpots = tableSpots;
    let playerAmount = Object.keys(connectedUsers).length;
    for (var i = 0; i < tempTableSpots.length; i++) {
      var tableSpot = tempTableSpots[i];
      if (tableSpot.username != undefined) {
        tableSpot.gameStatus = "active";
      }
    }
    tempTableSpots = assignRoles(tempTableSpots, playerAmount);
    tempTableSpots = emptyHands(tempTableSpots);
    tempTableSpots = dealCard(tempTableSpots);
    tempTableSpots = dealCard(tempTableSpots);
    io.emit("drawAllBackside", tempTableSpots);
    for (const id in connectedUsers) {
      if (Object.hasOwnProperty.call(connectedUsers, id)) {
        const element = connectedUsers[id];
        io.to(id).emit("drawHand", tempTableSpots[element]);
      }
    }
    activePLayers = getActivePlayersAmount(tempTableSpots);
    bettingRound(tempTableSpots);
  });
});
