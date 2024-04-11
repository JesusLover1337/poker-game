import {
  login,
  signup,
  raiseAction,
  logout,
  check,
  fold,
  toggleForm,
} from "./index.js";

const foldBtn = document.getElementById("fold");
const raiseBtn = document.getElementById("raise");
const checkBtn = document.getElementById("check");
const logInBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logout");
const toggleSignupBtn = document.getElementById("toggleSignup");
const toggleLoginBtn = document.getElementById("toggleLogin");

raiseBtn.addEventListener("click", raiseAction);
foldBtn.addEventListener("click", fold);
checkBtn.addEventListener("click", check);
logInBtn.addEventListener("click", login);
signupBtn.addEventListener("click", signup);
logoutBtn.addEventListener("click", logout);
toggleSignupBtn.addEventListener("click", toggleForm);
toggleLoginBtn.addEventListener("click", toggleForm);

console.log(logInBtn);
