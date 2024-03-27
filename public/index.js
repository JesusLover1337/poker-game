var socket = io();
const loginForm = document.querySelector(".form-container:nth-child(1)");
const signupForm = document.querySelector(".form-container:nth-child(2)");
const playingTable = document.getElementById("background");
const canvas = document.getElementById("canvas");
const logOutButton = document.getElementById("logout");
const bettingActions = document.getElementById("bettingActions");
let player = undefined;
function login(event) {
  event.preventDefault();
  let inputUsername = document.getElementById("username1");
  let inputPassword = document.getElementById("pass1");
  let username = inputUsername.value;
  let password = inputPassword.value;
  socket.emit("login", username, password);
}
function signup(event) {
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

function bettingAction(action) {
  socket.emit("bettingAction", action);
  bettingActions.style.display = "none";
}

var maxValue = 200;

function updateTextInput(val) {
  document.getElementById("raiseAmountDisplay").innerHTML = val;
}

function raiseAction() {
  var amount = document.getElementById("raiseAmount").value;
  bettingAction(amount);
}

window.onload = function () {
  document.getElementById("raiseAmount").setAttribute("max", maxValue);
  document.getElementById("raiseAmountDisplay").innerHTML =
    document.getElementById("raiseAmount").value;
};

socket.on("bettingRoundAction", (username, maxValue) => {
  if (username === player) {
    bettingActions.style.display = "block";
    /* document.getElementById("raiseAmount").setAttribute("max", maxValue);
    document.getElementById("raiseAmountDisplay").innerHTML =
    document.getElementById("raiseAmount").value;  */
  }
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
