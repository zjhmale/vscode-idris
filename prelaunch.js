const fs = require('fs-extra')
const chalk = require('chalk');

console.log(chalk.green.bold("Prelaunch started"))
fs.emptyDirSync("out")
fs.copySync("src", "out")
console.log(chalk.green.bold("Prelaunch finished"))