const path = require("path");
const fs = require("fs");

exports.serveHome = (req, res) => {
  const token = req.cookies.token;
  const filePath = token
    ? "../../front_end/pages/Homepages/home-user.html"
    : "../../front_end/pages/Homepages/ad.html";

  return res.sendFile(path.resolve(__dirname, filePath));
};

exports.serveGymPage = (req, res) => {
  const { thing, id } = req.params;

  let file = "";
  if (thing === "join" && id) {
    file = "joinGym.html";
  }  else if (thing === "qrcodescan" && !id) {
    file = "scanqrcode.html";
  } else {
    return res.status(404).sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
  }

  res.sendFile(path.resolve(__dirname, `../../front_end/pages/Gympages/${file}`));
};

exports.servePage = (page) => (req, res) => {
  if (!page.endsWith(".html")) page += ".html";
  const filePath = path.resolve(__dirname, `../../front_end/pages/Homepages/${page}`);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
    }
    res.sendFile(filePath);
  });
};

exports.handleNotFound = (req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "../../front_end/pages/error.html"));
};
