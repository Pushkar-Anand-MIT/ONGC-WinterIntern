// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ImageKit = require("imagekit");
const tokenService = require("./service/tokenservice");
const authenticate = require("./service/authenticate.middleware");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const mailservice = require("./service/mail.service");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());

var imagekit = new ImageKit({
  publicKey: "public_N2WCP9xb8QliDB+m3ZvzUz0SeZ4=",
  privateKey: "private_yhsb/5Z+qDEeD2YBy6KWCIJQrfQ=",
  urlEndpoint: "https://ik.imagekit.io/vparsitui",
});

app.get("/signature", (req, res) => {
  var authentcationParameters = imagekit.getAuthenticationParameters();
  //   console.log(req);
  res.send(authentcationParameters);
});

mongoose.connect("mongodb://localhost:27017/ongcDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const formSchema =
  // new Schema(
  {
    name: String,
    gender: String,
    dob: String,
    aadhar: Number,
    address: String,
    email: String,
    mobile: Number,
    branch: String,
    semester: String,
    pname: String,
    occupation: String,
    marks: Number,
    cgpa: Number,
    photograph: String,
    marksheet: String,
    lastsem: String,
    letter: String,
    status: String,
  };
// },
// { timestamps: true }
// );

const userSchema = {
  id: String,
  password: String,
};

const UserData = mongoose.model("Userdata", userSchema);
const user = new UserData({
  id: "admin@ongc.com",
  password: "admin",
});

user.save();

const Formdata = mongoose.model("Formdata", formSchema);

app.get("/", async function (req, res) {
  res.render("home", {});
});

app.get("/login", async function (req, res) {
  res.render("login", {});
});

app.post("/login", async function (req, res) {
  function setTokensInCookie(res, token) {
    // put it in cookie
    res.cookie("ongcookie", token.accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
    });
  }

  const { id, password } = req.body;
  try {
    // find the user by email
    const user = await UserData.findOne({ id: id });

    console.log({ user });

    if (!user) {
      return res.status(403).json({
        msg: "user not found",
      });
    }

    const match = password === user.password;
    if (!match) {
      return res.status(403).json({
        msg: "wrong credentials",
      });
    }
    // generate new token
    const { accessToken } = tokenService.generateToken({
      _id: user.id,
    });

    setTokensInCookie(res, { accessToken });

    // render the dashboard
    return res.redirect("/dashboard");
  } catch (err) {
    console.log({ err });
    // render server error
    return;
  }
});

app.get("/dashboard", authenticate, async function (req, res) {
  const applications = await Formdata.find({ status: "Pending" });
  res.render("dashboard.ejs", { applications });
});

app.get("/register", async function (req, res) {
  res.render("register", {});
});

app.post("/register", async function (req, res) {
  var name = req.body.name;
  var gender = req.body.gender;
  var dob = req.body.dob;
  var aadhar = req.body.aadhar;
  var address = req.body.address;
  var email = req.body.email;
  var mobile = req.body.mobile;
  var branch = req.body.branch;
  var semester = req.body.semester;
  var pname = req.body.pname;
  var occupation = req.body.occupation;
  var marks = req.body.marks;
  var cgpa = req.body.cgpa;
  var photograph = req.body.photograph;
  var marksheet = req.body.marksheet;
  var lastsem = req.body.lastsem;
  var letter = req.body.letter;
  const formdata = new Formdata({
    name: name,
    gender: gender,
    dob: dob,
    aadhar: aadhar,
    address: address,
    email: email,
    mobile: mobile,
    branch: branch,
    semester: semester,
    pname: pname,
    occupation: occupation,
    marks: marks,
    cgpa: cgpa,
    photograph: photograph,
    marksheet: marksheet,
    lastsem: lastsem,
    letter: letter,
    status: "Pending",
  });
  formdata.save();
  const sendmail = await mailservice.send(
    email,
    "Form Submitted Successfully",
    "Dear Candidate,<br>Thank you for submitting the ONGC intern application form. We have received your submission and it is being processed. We will review your submission and get back to you. If you have any questions in the meantime, please don't hesitate to contact us at ongc@gmail.com. Thank you for your patience and cooperation.Sincerely, ONGC"
  );
  res.render("register", {});
});

// app.get("/test", async function (req, res) {
//   const check = await mailservice.send("alsoamit@gmail.com", "test", "test");
//   console.log({ check });
// });

app.listen(3000, async function (err) {
  if (err) console.log("error");
  else console.log("success");
});
