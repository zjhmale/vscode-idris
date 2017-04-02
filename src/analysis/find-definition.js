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

let findDefinitionInFile = (definition, uri) => {
  let content = fs.readFileSync(uri).toString()
  let contents = content.split("\n")
  for (let i = 0; i < contents.length; i++) {
    if (contents[i].includes(definition)) {
      let moduleName = getModuleName(uri)
      if (moduleName) {
        return {
          path: uri,
          module: moduleName,
          line: i,
          column: contents[i].indexOf(definition)
        }
      }
    }
  }
}

let findDefinitionInFiles = (definition, uri) => {
  let files = glob.sync(commands.getSafeRoot() + "/**/*")
  locations = []
  files.forEach((file) => {
    if (file.endsWith(".idr")) {
      let location = findDefinitionInFile(definition, file)
      if (location) {
        locations.push(location)
      }
    }
  })
  let importedModules = getImportedModules(uri)
  let legalLocations = locations.filter((loc) => {
    return loc.path == uri || importedModules.includes(loc.module)
  })
  return legalLocations[0]
}

module.exports = {
  findDefinitionInFiles
}