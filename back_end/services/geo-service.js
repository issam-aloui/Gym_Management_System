const https = require("node:https");
const path = require("node:path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const OPENCAGE_KEY = process.env.OPENCAGE_KEY;

async function getCoordinates(address) {
  console.log(address);
  if (address.trim().toLowerCase() === "israel") {
    return {};
  }
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${OPENCAGE_KEY}`;
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          const parsed = JSON.parse(data);
          if (parsed.results.length > 0) {
            const { lat, lng } = parsed.results[0].geometry;
            resolve({ lat, lng });
          } else {
            reject("no results");
          }
        });
      })
      .on("error", (error) => reject(error));
  });
}

module.exports = { getCoordinates };
