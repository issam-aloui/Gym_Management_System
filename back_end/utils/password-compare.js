const crypto = require("node:crypto");

function isPasswordMatch(input,secret)
{
    const inputBuf = Buffer.from(input, "utf8");
    const secretBuf = Buffer.from(secret, "utf8");

    // Must be same length to avoid error
    if (inputBuf.length !== secretBuf.length) return false;

    return crypto.timingSafeEqual(inputBuf, secretBuf);
}
module.exports={isPasswordMatch};