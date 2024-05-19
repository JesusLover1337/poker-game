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
    let loginSuccess = false;
    if (!username) username = undefined;
    if (!password) password = undefined;
    con.query("SELECT * FROM acounts", function (err, results, fields) {
      if (err) throw err;
      results.forEach((account) => {
        if (username === account.name && password === account.password) {
          loginSuccess = true;
          tableSpots.forEach((spot) => {
            if (username === spot.username) {
              loginSuccess = false;
            }
          });
          if (loginSuccess) {
            console.log("user exists");
            addPlayerToTable(account, socket.id);
            socket.emit(
              "loginsuccess",
              account.name,
              Object.keys(connectedUsers).length
            );
            io.emit("playerJoined", Object.keys(connectedUsers).length);
          }
        }
        if (!loginSuccess) {
          socket.emit("loginunsuccessful");
        }
      });
    });
  });
  socket.on("signup", (username, email, password) => {
    var startingchips = 25000;
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
        socket.emit("signinunsuccessful");
      }
    });
  });
  socket.on("logout", (player) => {
    removePlayerFromTable(player);
    socket.emit("removeProfile", "all"); // revmoves all from logged out player (profile)
    io.emit("removeProfile", connectedUsers[socket.id]); // removes logged out player from rest (profile)
    delete connectedUsers[socket.id];
    io.emit("playerJoined", Object.keys(connectedUsers).length);
  });

  function drawProfiles(table, index) {
    for (let i = 0; i < table.length; i++) {
      const Spot = table[i];
      if (Spot.username != undefined) {
        io.emit("drawAllProfiles", i, Spot.username, Spot.chips, index === i);
        if (roundsPlayed !== 0) {
          var cards = [...board, ...Spot.hand];
          var res = Ranker.getHand(cards);
          io.to(
            Object.keys(connectedUsers).find((key) => connectedUsers[key] === i)
          ).emit("sendHand", res.ranking, i);
        }
      }
    }
  }

  function handleOnePlayerLeft(table, index) {
    let winnerIndex = table.findIndex(
      (spot) => spot.gameStatus === "active" || spot.gameStatus === "allIn"
    );
    tempTableSpots = handleresult([[{ id: winnerIndex }]], tempTableSpots);
    io.emit("drawTableX", null, null, table[index].username);
  }

  function getAndDisplayResults(board) {
    let hands = getActivePlayersHands(tempTableSpots);
    var results = Ranker.orderHands(hands, board);
    tempTableSpots = handleresult(results, tempTableSpots);
    io.emit("displayResults", tempTableSpots, results[0]);
  }

  function sendBettingOption(table, index) {
    drawProfiles(table, index);
    let activePlayers = getActivePlayersAmount(tempTableSpots);
    let allInPlayers = tempTableSpots.filter(
      (tableSpot) => tableSpot.gameStatus === "allIn"
    ).length;
    if (activePlayers + allInPlayers === 1) {
      handleOnePlayerLeft(table, index);
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
          getAndDisplayResults(board);
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
    var index = getIndexofDealer(table);
    sendBettingOption(table, index);
  }
  socket.on("bettingAction", (action) => {
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
    } else if (action[0] === "call" || action[0] === "raise") {
      let amount = Number(action[1]);
      tempTableSpots[index].chips -= amount;
      if (tempTableSpots[index].chips === 0) {
        tempTableSpots[index].gameStatus = "allIn";
      }
      if (action[0] === "raise") {
        activePLayers = getActivePlayersAmount(tempTableSpots) - 1;
      }
      tempTableSpots[index].bettedAmount += amount;
      currentBetAmount = tempTableSpots[index].bettedAmount;
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    }
  });

  socket.on("roundStart", () => {
    for (var i = 0; i < tempTableSpots.length; i++) {
      var tableSpot = tempTableSpots[i];
      if (tableSpot.chips < 1) {
        removePlayerFromTable(tableSpot.username);
      }
    }
    tempTableSpots = tableSpots;
    for (var i = 0; i < tempTableSpots.length; i++) {
      var tableSpot = tempTableSpots[i];
      if (tableSpot.username != undefined) {
        tableSpot.gameStatus = "active";
      }
    }
    if (getActivePlayersAmount(tempTableSpots) < 3) {
      io.emit("playerJoined", Object.keys(connectedUsers).length);
    } else {
      currentBetAmount = 40;
      let = board = [];
      resetCarddeck();
      roundsPlayed = 0;
      let playerAmount = Object.keys(connectedUsers).length;
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
    }
  });
});
