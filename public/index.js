var socket = io();
const loginForm = document.querySelector(".form-container:nth-child(1)");
const signupForm = document.querySelector(".form-container:nth-child(2)");
const playingTable = document.getElementById("background");
const canvas = document.getElementById("canvas");
const logOutButton = document.getElementById("logout");
const bettingActions = document.getElementById("bettingActions");
const ctx = canvas.getContext("2d");
const cardDeck = document.getElementById("cardDeck");
const cardHeight = 74.5;
const cardWidth = 51.5;
const canvas_width = (canvas.width = 800);
const canvas_height = (canvas.height = 500);
let player = undefined;
let toBet;

import { cardToPos, tableCardsPos } from "./draw.js";

function drawCard(pos, location) {
  ctx.drawImage(
    cardDeck,
    cardWidth * pos.PosX,
    cardHeight * pos.PosY,
    cardWidth,
    cardHeight,
    location.x,
    location.y,
    cardWidth / 1.5,
    cardHeight / 1.5
  );
}

export function login(event) {
  event.preventDefault();
  let inputUsername = document.getElementById("username1");
  let inputPassword = document.getElementById("pass1");
  let username = inputUsername.value;
  let password = inputPassword.value;
  socket.emit("login", username, password);
}
export function signup(event) {
  event.preventDefault();
  let inputUsername = document.getElementById("username2");
  let inputPassword = document.getElementById("password2");
  let inputEmail = document.getElementById("email");
  let username = inputUsername.value;
  let password = inputPassword.value;
  let email = inputEmail.value;
  socket.emit("signup", username, email, password);
}

socket.on("sendHand", (hand, id) => {
  console.log(hand);
  document.getElementById(`turn${id}`).innerHTML = `${hand}`;
});

socket.on("drawAllProfiles", (id, username, chips, isUserTurn) => {
  const colorToDisplay = isUserTurn === true ? "green" : "red";
  document.getElementById(`boxid${id}`).style.display = "inline-block";
  document.getElementById(`user${id}`).innerHTML = `${username}`;
  document.getElementById(`chips${id}`).innerHTML = `Chips: ${chips}`;
  document.getElementById(
    `boxid${id}`
  ).style.backgroundColor = `${colorToDisplay}`;
});

socket.on("playerJoined", (players) => {
  if (player != undefined) {
    document.getElementById("loading-screen").style.display = "inline-block";
  } else {
    document.getElementById("loading-screen").style.display = "none";
  }
  document.getElementById("player-count").innerText = `${players} av 3`;

  if (players >= 3) {
    document.getElementById("loading-screen").style.display = "none";
  }
});

socket.on("loginsuccess", (name, playerAmount) => {
  document.getElementById("error-message-login").style.display = "none";
  togglelogin();
  player = name;
  if (playerAmount >= 3) {
    //kankse funkar med 2 nu för att man är ju ganska cool
    socket.emit("roundStart");
  }
});

socket.on("loginunsuccessful", () => {
  document.getElementById("error-message-login").style.display = "block";
});

socket.on("signinsuccess", () => {
  document.getElementById("error-message-signup").style.display = "none";
  toggleForm();
});

socket.on("signinunsuccessful", () => {
  document.getElementById("error-message-signup").style.display = "block";
});

export function fold(event) {
  event.preventDefault();
  bettingAction("fold");
}
export function check(event) {
  event.preventDefault();
  bettingAction("check");
}
export function call(event) {
  event.preventDefault();
  bettingAction(["call", toBet]);
}

function bettingAction(action) {
  socket.emit("bettingAction", action);
  bettingActions.style.display = "none";
}

export function updateTextInput(event) {
  let val = event.target.value;
  document.getElementById("raiseAmountDisplay").innerHTML = val;
}

export function raiseAction() {
  var amount = document.getElementById("raiseAmount").value;
  bettingAction(["raise", amount]);
}

function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

socket.on("displayResults", (table, result) => {
  ctx.font = "100px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  let winners = undefined;
  result.forEach((player) => {
    let name = table[player.id].username;
    if (winners === undefined) {
      winners = `${name}`;
    } else {
      winners += ` & ${name}`;
    }
  });
  ctx.textBaseline = "bottom";
  ctx.fillText(`${winners}`, canvas_width / 2, canvas_height / 2);
  ctx.textBaseline = "top";
  ctx.fillText("IS THE WINNER!!", canvas_width / 2, canvas_height / 2);
});

async function endGame(username) {
  bettingActions.style.display = "none";
  await sleep(5555);
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  if (username === player) {
    socket.emit("roundStart");
  }
}

socket.on(
  "bettingRoundAction",
  (username, maxValue, betAmountTable, betAmountPlayer) => {
    if (username === player) {
      toBet = betAmountPlayer - betAmountTable;
      console.log(toBet);
      bettingActions.style.display = "block";
      if (toBet > maxValue) {
        document.getElementById("check").style.display = "none";
        document.getElementById("call").style.display = "none";
        document.getElementById("raiseAmount").style.display = "none";
        document.getElementById("raise").style.display = "none";
      } else if (toBet > 0) {
        document.getElementById("raiseAmount").style.display = "inline-block";
        document.getElementById("raise").style.display = "inline-block";
        document.getElementById("check").style.display = "none";
        document.getElementById("call").style.display = "inline-block";
        document.getElementById("call").innerHTML = `Call: ${toBet}`;
      } else {
        document.getElementById("check").style.display = "inline-block";
        document.getElementById("call").style.display = "none";
        document.getElementById("raiseAmount").style.display = "inline-block";
        document.getElementById("raise").style.display = "inline-block";
      }
      document.getElementById("raiseAmount").setAttribute("max", maxValue);
      document.getElementById("raiseAmount").setAttribute("min", toBet + 1);
      document.getElementById("raiseAmountDisplay").innerHTML =
        document.getElementById("raiseAmount").value;
    }
  }
);

socket.on("drawTableX", (spot, cards, username) => {
  if (spot === null) {
    endGame(username);
  } else {
    const tableIndex = {
      flop: 0,
      turn: 3,
      river: 4,
    };
    //ändra namn
    var x = tableIndex[spot];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      var indexCordinetds = i + x;
      var cardCordinetds = tableCardsPos[indexCordinetds];
      drawCard(cardToPos(card), cardCordinetds);
    }
  }
});

export function toggleForm() {
  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}
export function logout() {
  let tempPlayername = player;
  loginForm.style.display = "block";
  playingTable.style.display = "none";
  canvas.style.display = "none";
  logOutButton.style.display = "none";
  player = undefined;
  console.log(tempPlayername);
  socket.emit("logout", tempPlayername);
}
function togglelogin() {
  loginForm.style.display = "none";
  signupForm.style.display = "none";
  playingTable.style.display = "block";
  canvas.style.display = "block";
  logOutButton.style.display = "block";
}

socket.on("drawAllBackside", (spots) => {
  spots.forEach((spot) => {
    if (spot.gameStatus === "active") {
      drawCard({ PosX: 2, PosY: 4 }, { x: spot.card1posX, y: spot.card1posY });
      drawCard({ PosX: 2, PosY: 4 }, { x: spot.card2posX, y: spot.card2posY });
    }
  });
});

socket.on("drawHand", (spot) => {
  if (spot.gameStatus === "active") {
    let card1 = spot.hand[0];
    let card2 = spot.hand[1];
    drawCard(cardToPos(card1), { x: spot.card1posX, y: spot.card1posY });
    drawCard(cardToPos(card2), { x: spot.card2posX, y: spot.card2posY });
  }
});
