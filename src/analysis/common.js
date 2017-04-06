const fs = require("fs")
const glob = require("glob")
const commands = require("../idris/commands")

let identRegex = /'?[a-zA-Z0-9_][a-zA-Z0-9_-]*'?/g
let identMatch
let identList

let getIdentList = (uri) => {
  identList = []

  let content = fs.readFileSync(uri).toString()
  while (identMatch = identRegex.exec(content)) {
    let ident = identMatch[0]
    if (identList.indexOf(ident) <= -1) {
      identList.push(ident)
    }
  }
  return identList
}

let getModuleName = (uri) => {
  let content = fs.readFileSync(uri).toString()
  let modulePattern = /\bmodule(.*)\s+/g
  let moduleMatch = modulePattern.exec(content)
  return moduleMatch ? moduleMatch[1].trim() : null
}

let getImportedModules = (uri) => {
  let content = fs.readFileSync(uri).toString()
  let importPattern = /import(.*)\r\n/g
  let match
  let importedModules = []
  while (match = importPattern.exec(content)) {
    importedModules.push(match[1].trim())
  }
  return importedModules
}

let getAllFiles = (ext) => {
  let files = glob.sync(commands.getSafeRoot() + "/**/*")
  return files.filter((file) => file.endsWith(`.${ext}`))
}

module.exports = {
  getIdentList,
  getModuleName,
  getImportedModules,
  getAllFiles
}