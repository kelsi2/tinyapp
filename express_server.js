const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const cookieSession = require("cookie-session");
const {generateRandomString, userEmailCheck, urlsForUser, findUserID} = require("./helperFunctions");
const {urls, users} = require("./variables");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({name: "session", keys: ["key1", "key2"]}));

app.set("view engine", "ejs");
app.set("trust proxy", 1);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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

//shows an index of URLs as long as user is logged in
app.get("/urls", (req, res) => {
  if (!users[req.session.id]) {
    res.status(403).send("Please login to view your short URLs.");
  } else {
    const templateVars = {
      user: users[req.session.id],
      urls: urlsForUser(req.session.id),
      email: userEmailCheck(req.session.id, users)
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
    res.status(401).redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//Create new short URL, if not logged in redirect to login page. If logged in create url and save it to that user.
app.post("/urls", (req, res) => {
  if (!req.body.longURL) {
    res.status(403).send("Please enter a url to shorten.");
  }
  if (req.session.id) {
    const shortURL = generateRandomString();
    urls[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.id
    };
    req.params.shortURL = shortURL;
    res.redirect(`/urls/${shortURL}`);
  }
  if (!users[req.session.id]) {
    res.status(401).redirect("/login");
  }
});

//Shows added url, if user is not logged in redirects to login page
app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.id]) {
    let userURL = urlsForUser(req.session.id);
    if (req.params.shortURL in userURL) {
      let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urls[req.params.shortURL].longURL,
        user: users[req.session.id],
      };
      res.render("urls_show", templateVars);
      return;
    } else {
      res.status(403).send("You cannot view URLs that you don't own.");
    }
  }
  if (!users[req.session.id]) {
    res.status(403).send("Please login to view your short URLs.");
  }
});

//Edit an existing URL
app.post("/urls/:id", (req, res) => {
  if (users[req.session.id]) {
    const userURL = urlsForUser(req.session.id);
    for (let url in userURL) {
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
    const userURL = urlsForUser(req.session.id);
    for (let url in userURL) {
      if (!req.params.shortURL === url) {
        res.status(401).redired("/login");
      }
    }
    delete urls[req.params.id];
    res.redirect("/urls");
  }
});

//Redirect when long URL is entered
app.get("/u/:shortURL", (req, res) => {
  if (urls[req.params.shortURL]) {
    const longURL = urls[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(401).send("That URL does not exist.");
  }
});
//----------------------------User Login/Logout-------------------------

//Add login page. If user is logged in already redirect to the urls page.
app.get("/login", (req, res) => {
  if (users[req.session.id]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.id]
    };
    res.render("login", templateVars);
  }
});

//Create login endpoint to take in login data
app.post("/login", (req, res) => {
  const email = req.body.email;
  console.log(email);
  const password = req.body.password;
  console.log(password);
  let userFound = userEmailCheck(email);
  console.log(userFound);
  if (userFound) {
    const userId = findUserID(email);
    req.session.id = userId;
    res.redirect("/urls");
  }
  if (!email || !password) {
    res.status(400).send("Please enter an email and password");
  }
  if (!userFound) {
    res.status(400).send("Email not registered, please try again.");
  }
  if (userFound.password !== password) {
    res.status(403).send("Password incorrect");
  }
});

//Clear login cookies and logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// -----------------------------User Registration---------------------

//Create registration page. If user is already logged in redirect to urls page.
app.get("/register", (req, res) => {
  if (users[req.session.id]) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.id]
    };
    res.render("register", templateVars);
  }
});

//Create registration endpoint to take in registration data. Redirect to login once complete.
app.post("/register", (req, res) => {
  if (!req.body.email && !req.body.password) {
    res.status(400).send("Please enter a valid email and password.");
  }
  if (userEmailCheck(req.body.email)) {
    res.status(400).send("Email already registered, try logging in.");
  }

  let id = uuid.v4().split('-')[1];
  req.session.id = id;
  users[req.session.id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  res.redirect("/login");
});