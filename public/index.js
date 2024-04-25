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

socket.on("loginsuccess", (name, playerAmount) => {
  togglelogin();
  player = name;
  if (playerAmount >= 3) {
    socket.emit("roundStart");
  }
});
socket.on("signinsuccess", () => {
  toggleForm();
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
  bettingAction(toBet);
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
  bettingAction(amount);
}

socket.on(
  "bettingRoundAction",
  (username, maxValue, betAmountTable, betAmountPlayer) => {
    if (username === player) {
      toBet = betAmountPlayer - betAmountTable;
      if (toBet > maxValue) {
        //allin type shi
      }
      bettingActions.style.display = "block";
      if (toBet > 0) {
        document.getElementById("check").style.display = "none";
        document.getElementById("call").style.display = "inline-block";
        document.getElementById("call").innerHTML = `Call: ${toBet}`;
      } else {
        document.getElementById("check").style.display = "inline-block";
        document.getElementById("call").style.display = "none";
      }
      document.getElementById("raiseAmount").setAttribute("max", maxValue);
      document.getElementById("raiseAmountDisplay").innerHTML =
        document.getElementById("raiseAmount").value;
    }
  }
);

socket.on("drawTableX", (spot, cards, username) => {
  if (spot === null) {
    bettingActions.style.display = "none";
    ctx.clearRect(0, 0, canvas_width, canvas_height);
    if (username === player) {
      socket.emit("roundStart");
    }
  }
  const abc = {
    flop: 0,
    turn: 3,
    river: 4,
  };
  var x = abc[spot];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    var indexCordinetds = i + x;
    var cardCordinetds = tableCardsPos[indexCordinetds];
    drawCard(cardToPos(card), cardCordinetds);
  }

  //drawCard(cardToPos(card), {x:0,y:0});
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
  loginForm.style.display = "block";
  playingTable.style.display = "none";
  canvas.style.display = "none";
  logOutButton.style.display = "none";
  console.log(player);
  socket.emit("logout", player);
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
