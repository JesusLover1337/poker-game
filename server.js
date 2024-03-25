var mysql = require("mysql");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { tableSpots } = require("./tableSpots");
const io = new Server(server);
import { emptyHands } from "./game-functions";
import { handleFold } from "./game-functions";
import { deck } from "./game-functions";
import { bettingRound } from "./game-functions";
import { getActivePlayersAmount } from "./game-functions";
import { dealCard } from "./game-functions";
import { assignRoles } from "./game-functions";
import { bettingRound } from "./game-functions";
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

export let tempCardDeck = deck;

var tempTableSpots = tableSpots;

export let currentRoleIndex = 0;

function addPlayerToTable(player) {
  for (var i = 0; i < tableSpots.length; i++) {
    var tableSpot = tableSpots[i];
    if (tableSpot.username === undefined) {
      tableSpot.username = player.name;
      tableSpot.chips = player.chips;
      console.log(tableSpots);
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
          addPlayerToTable(account);
          socket.emit("loginsuccess", account.name);
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
  });

  function sendBettingOption(table, index) {
    if (table[index].gameStatus === "active") {
      if (activePLayers > 0) {
        activePLayers = activePLayers - 1;
        socket.emit(
          "bettingRoundAction",
          table[index].username,
          table[index].chips
        );
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
      handleFold(tempTableSpots[index].username);
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    } else if (action === "check") {
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    } else if (typeof action === Number) {
      activePLayers = getActivePlayersAmount(tempTableSpots); //reset shi so it do
      //action = amout betted set ting to other ting type shi
      index = (index + 1) % tempTableSpots.length;
      sendBettingOption(tempTableSpots, index);
    }
  });

  socket.on("roundStart", () => {
    tempTableSpots = tableSpots;
    for (var i = 0; i < tempTableSpots.length; i++) {
      var tableSpot = tempTableSpots[i];
      tableSpot.gameStatus = "active";
    }
    tempTableSpots = assignRoles(tempTableSpots);
    tempTableSpots = emptyHands(tempTableSpots);
    tempCardDeck = deck;
    tempTableSpots = dealCard(tempTableSpots);
    tempTableSpots = dealCard(tempTableSpots);
    //betting round 1
    activePLayers = getActivePlayersAmount(tempTableSpots);
    tempTableSpots = bettingRound(tempTableSpots);

    //flop

    //betting round 2

    //turn

    //betting round 3

    //river

    //betting round 4

    //who won... payouts... start next round...
  });
});
