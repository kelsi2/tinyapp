const express = require("express");
const app = express();
const PORT = 8081; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const helperFunctions = require("./helperFunctions");
const urls = require("./urls");
const users = require("./users");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({name: "session", keys: ["key1", "key2"]}));

app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json(urls);
});

//root route; if user is logged in they are directed to their urls, otherwise they are directed to login
app.get("/", (req, res) => {
  if (users[req.session.id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Create registration page. If user is already logged in redirect to urls page.
app.get("/register", (req, res) => {
  if (users[req.session.id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.id]
    };
    res.render("register", templateVars);
  }
});

//Add login page. If user is logged in already redirect to the urls page.
app.get("/login", (req, res) => {
  if (users[req.session.id]) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.id]
    };
    res.render("login", templateVars);
  }
});

//shows an index of URLs as long as user is logged in
app.get("/urls", (req, res) => {
  if (!users[req.session.id]) {
    res.status(403).send("You need to <a href='/login'>login</a> to view that content.");
  } else {
    const templateVars = {
      user: users[req.session.id],
      urls: helperFunctions.urlsForUser(req.session.id, urls),
      email: helperFunctions.userEmailCheck(req.session.id, users)
    };
    res.render("urls_index", templateVars);
  }
});

//add new URL to user URLs if user is logged in
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.id]
  };
  if (!users[req.session.id]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//Shows added url, if user is not logged in redirects to login page
app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.id]) {
    helperFunctions.urlsForUser(req.session.id, urls);
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urls[req.params.shortURL].longURL,
      user: users[req.session.id],
    };
    res.render("urls_show", templateVars);
  }
  if (!users[req.session.id]) {
    res.status(403).send("You need to <a href='/login'>login</a> to view that content.");
  }
});

//Redirect when long URL is entered
app.get("/u/:id", (req, res) => {
  if (!urls[req.params.id]) {
    res.status(401).send("That URL does not exist. 😿 <a href='/urls/new'>Try making a new one.</a>");
  } else {
    res.redirect(urls[req.params.id].longURL);
  }
});

//Create new short URL, if not logged in redirect to login page. If logged in create url and save it to that user.
app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    res.status(403).send("Please <a href='/urls/new'>enter a url</a> to shorten.");
  }
  if (req.session.id) {
    const shortURL = helperFunctions.generateRandomString();
    urls[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.id
    };
    req.params.shortURL = shortURL;
    res.redirect(`/urls/${shortURL}`);
  }
  if (!users[req.session.id]) {
    res.status(401).send("You need to <a href='/login'>login</a> to view that content.");
  }
});

//Edit an existing URL
app.post("/urls/:id", (req, res) => {
  if (users[req.session.id]) {
    const userURL = helperFunctions.urlsForUser(req.session.id);
    for (const url in userURL) {
      if (!req.params.shortURL === url) {
        res.status(401).send("That URL does not belong to you.");
      }
    }
    urls[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

//Delete a URL. If user is not logged in redirect to login page.
app.post("/urls/:id/delete", (req, res) => {
  if (users[req.session.id]) {
    const userURL = helperFunctions.urlsForUser(req.session.id, urls);
    for (const url in userURL) {
      if (!req.params.shortURL === url) {
        res.status(401).send("You need to <a href='/login'>login</a> to view that content.");
      }
    }
    delete urls[req.params.id];
    res.redirect("/urls");
  }
});

//Create login endpoint to take in login data
app.post("/login", (req, res) => {
  const email = req.body.email;
  const enteredPassword = req.body.password;
  const userFound = helperFunctions.userEmailCheck(email, users);
  if (!email || !enteredPassword) {
    res.status(400).send("Please <a href='/login'>enter an email and password</a>");
  }
  if (!userFound) {
    res.status(400).send("Email not registered, <a href='/login'>please try again</a> or <a href='/register'>register</a>.");
  }
  if (userFound) {
    if (bcrypt.compareSync(enteredPassword, userFound.password)) {
      const userId = helperFunctions.findUserID(email, users);
      req.session.id = userId;
      res.redirect("/urls");
    } else {
      res.status(403).send("Password incorrect. <a href='/login'>Please try again</a>.");
    }
  }
});

//Clear login cookies and logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Create registration endpoint to take in registration data. Redirect to login once complete.
app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  if (!req.body.email && !req.body.password) {
    res.status(400).send("Please <a href='/register'>enter a valid email and password</a>.");
  }
  if (helperFunctions.userEmailCheck(req.body.email, users)) {
    res.status(400).send("Email already registered, <a href='/login'>try logging in</a>.");
  }

  let id = uuid.v4().split('-')[1];
  req.session.id = id;
  users[req.session.id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword
  };
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});