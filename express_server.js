const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const {generateRandomString, userEmailCheck} = require("./helperFunctions");
const {urlDatabase, users} = require("./variables");

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//root route
app.get("/", (req, res) => {
  res.send("Hello!");
});

//shows an index of URLS
app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//add new URL
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
    //add other variables here
  };
  res.render("urls_new", templateVars);
});

//Create new short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete a URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Edit an existing URL
app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//Redirect when long URL is entered
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Shows added url
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

//----------------------------User-------------------------

//Add login cookie
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

//Clear login cookies and logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Create registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

//Create registration endpoint to take in registration data
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = userEmailCheck(email);
  const user_id = uuid.v4().split('-')[1];

  if (!email || !password) {
    res.status(400).send("Please enter a valid email and password.");
  }

  if (foundUser) {
    return res.status(400).send("Email already registered, try logging in.");
  }

  const newUser = {
    id: user_id,
    email: email,
    password: password
  };

  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
  console.log(users);
});

//Add login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

//Create login endpoint to take in login data
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = userEmailCheck(email);

  if (foundUser === null) {
    return res.status(400).send("That email is not registered. Do you need to register?");
  }
  if (foundUser.password !== password) {
    return res.status(400).send("Password incorrect");
  }
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});