var mysql = require("mysql");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { tableSpots } = require("./tableSpots");
const io = new Server(server);
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
function addPlayerToTable(player) {
  for (var tableSpotKey in tableSpots) {
    var tableSpot = tableSpots[tableSpotKey];
    if (tableSpot.username == undefined) {
      tableSpot.username = player.name;
      tableSpot.chips = player.chips;
      /* console.log(tableSpots); */
      break;
    }
  }
}
function removePlayerFromTable(player) {
  for (var tableSpotKey in tableSpots) {
    var tableSpot = tableSpots[tableSpotKey];
    if (tableSpot.username == player) {
      tableSpot.username = undefined;
      //update database with chip amount
      tableSpot.chips = undefined;
      /* console.log(tableSpots); */
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
});
