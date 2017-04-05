const fs = require("fs")
const glob = require("glob")
const commands = require("../idris/commands")

let getModuleName = (uri) => {
  let content = fs.readFileSync(uri).toString()
  let modulePattern = /module(.*)\r\n/g
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
  getModuleName,
  getImportedModules,
  getAllFiles
}