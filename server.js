// create missing files if project is new
const fs = require('fs');
const dir = './db';
const config = './config.json';
const configDef = {
  token: "???"
}

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
  console.log("New db directory created");
}
// fs.closeSync(fs.openSync('./config.json', 'a'))
if (!fs.existsSync(config)) {
  fs.writeFileSync(config, JSON.stringify(configDef));
  console.log("New config file created");
}

// Transpile all code following this line with babel and use 'env' (aka ES6) preset.
require("babel-register")({
  presets: ["env"],
});
require("babel-polyfill");

// Import the rest of our application.
module.exports = require("./src/api.js");
