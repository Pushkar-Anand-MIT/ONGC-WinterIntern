// jshint esversion:6
const tokenservice = require("./tokenservice");

async function authenticate(req, res, next) {
  try {
    const cookies = req.cookies;
    if (!cookies) {
      return res.redirect("/login");
    }

    const { ongcookie } = cookies;
    if (!ongcookie) {
      return res.redirect("/login");
    }

    const flag = tokenservice.verifyAccessToken(ongcookie);
    if (!flag) {
      return res.redirect("/login");
    }
    next();
  } catch (e) {
    console.log(e);
  }
}

module.exports = authenticate;
