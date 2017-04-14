const CSON = require("cson")
const request = require('request');
const chalk = require('chalk');
const fs = require('fs')
const join = require('path').join

let getCSONFile = (url, callback) => {
  request(url, function (error, response, body) {
    if (error == null && response.statusCode == 200) {
      console.log(chalk.green.bold(`Downloaded ${url}`))
      callback(body)
    } else {
      console.log(chalk.red.bold(`Download ${url} failed`))
    }
  })
}

let toJSON = (text, name) => {
  let space = "\t"

  try {
    let parsed = CSON.parse(text)
    console.log(chalk.green.bold(`Translated ${name}`))
    return JSON.stringify(parsed, null, space)
  } catch (error) {
    console.log(chalk.red.bold(`Translate ${name} failed`))
    return null
  }
}

let translate = (name) => {
  let url = `https://raw.githubusercontent.com/idris-hackers/atom-language-idris/master/grammars/language-${name}.cson`
  getCSONFile(url, (csonFile) => {
    let jsonFile = toJSON(csonFile, name)
    if (jsonFile == null) return

    let file = join(__dirname, `/syntaxes/${name}.json`)
    fs.writeFileSync(file, jsonFile)
  })
}

translate("idris")
translate("ipkg")
translate("idris.literate")