const fs = require("fs")

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

module.exports = {
	getModuleName,
	getImportedModules
}