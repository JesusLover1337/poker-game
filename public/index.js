var socket = io();
const loginForm = document.querySelector(".form-container:nth-child(1)");
const signupForm = document.querySelector(".form-container:nth-child(2)");
const playingTable = document.getElementById("background");
const canvas = document.getElementById("canvas");
const logOutButton = document.getElementById("logout");
const bettingActions = document.getElementById("bettingActions");
let player = undefined;
const ctx = canvas.getContext("2d");
const cardDeck = document.getElementById("cardDeck");
const cardHeight = 74.5;
const cardWidth = 51.5;

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

function fold(event) {
  event.preventDefault();
  bettingAction("fold");
}

function bettingAction(action) {
  socket.emit("bettingAction", action);
  bettingActions.style.display = "none";
}

function updateTextInput(val) {
  document.getElementById("raiseAmountDisplay").innerHTML = val;
}

function raiseAction() {
  var amount = document.getElementById("raiseAmount").value;
  bettingAction(amount);
}

socket.on("bettingRoundAction", (username, maxValue) => {
  console.log(username);
  if (username === player) {
    bettingActions.style.display = "block";
    document.getElementById("raiseAmount").setAttribute("max", maxValue);
    document.getElementById("raiseAmountDisplay").innerHTML =
      document.getElementById("raiseAmount").value;
  }
});

socket.on("drawTableX", (spot, cards) => {
  console.log(spot);
  console.log(cards);
  const abc = {
    flop: 0,
    turn: 3,
    river: 4,
  };
  var x = abc[spot];
  /*   if (spot === "flop") {
    var x = 0;
  } else if (spot === "turn") {
    var x = 3;
  } else if (spot === "river") {
    var x = 4;
  } */
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    var indexCordinetds = i + x;
    var cardCordinetds = tableCardsPos[indexCordinetds];
    drawCard(cardToPos(card), cardCordinetds);
  }

  //drawCard(cardToPos(card), {x:0,y:0});
});

function toggleForm() {
  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  } else {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  }
}
function logout() {
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
