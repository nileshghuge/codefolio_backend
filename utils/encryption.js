const CryptoJS = require("crypto-js");

const SECRET_KEY =
  process.env.ENCRYPTION_KEY || "mindwell-secret-key";

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decrypt(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(
    encryptedText,
    SECRET_KEY
  );

  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
  encrypt,
  decrypt,
};