import { login, signup, bettingAction, raiseAction } from ".";

const foldBtn = document.getElementById("fold");
const raiseBtn = document.getElementById("raise");
const checkBtn = document.getElementById("check");
const logInBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signUpBtn");

raiseBtn.addEventListener("click", raiseAction);
foldBtn.addEventListener("click", bettingAction("fold"));
checkBtn.addEventListener("click", bettingAction("check"));
logInBtn.addEventListener("click", login);
signupBtn.addEventListener("click", signup);
