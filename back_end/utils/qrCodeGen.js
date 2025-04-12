const QRCode = require("qrcode");
const fs = require("fs");

const generateQR = async (gymId) => {
  const url = `https://yourdomain.com/api/checkin?gymId=${gymId}`;
  const path = `./qrcodes/${gymId}.png`;

  await QRCode.toFile(path, url);
  console.log("QR code saved to:", path);
};

generateQR("YOUR_GYM_ID_HERE");