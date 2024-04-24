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
      tableSpot.username = undefined;
      // Update database with chip amount
      tableSpot.chips = undefined;
      console.log(tableSpots);
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
    if (table[index].gameStatus === "active") {
      if (activePLayers > 0) {
        activePLayers = activePLayers - 1;
        console.log("index", index);
        io.emit(
          "bettingRoundAction",
          table[index].username,
          table[index].chips
        );
      } else if (activePLayers === 0) {
        if (roundsPlayed === 3) {
          console.log("game finish");
          console.log(board);
          console.log(getActivePlayersHands(tempTableSpots));
          let hands = getActivePlayersHands(tempTableSpots);
          var results = Ranker.orderHands(hands, board);
          console.log(results);
        }
        console.log("round done");
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
    let bettingRoundResults = sendBettingOption(table, index);
    return bettingRoundResults;
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
    } else if (typeof Number(action) === "number") {
      action = Number(action);
      activePLayers = getActivePlayersAmount(tempTableSpots) - 1;
      tempTableSpots[index].bettedAmount = action;
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    }
  });

  socket.on("roundStart", () => {
    //check if 3 players
    //check if broke
    let = board = [];
    resetCarddeck();
    roundsPlayed = 0;
    var tempTableSpots = tableSpots;
    let playerAmount = Object.keys(connectedUsers).length;
    //ändra så alltid funka if usernamne != undef elr nåt om 4 kör och player 2 lämnar
    for (var i = 0; i < playerAmount; i++) {
      var tableSpot = tempTableSpots[i];
      tableSpot.gameStatus = "active";
    }
    tempTableSpots = assignRoles(tempTableSpots, playerAmount);
    console.log(tempTableSpots);
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
