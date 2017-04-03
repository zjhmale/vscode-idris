const fs = require("fs")
const glob = require("glob")
const commands = require("../idris/commands")
const common = require('./common')

let findDefinitionInFile = (definition, uri) => {
  let content = fs.readFileSync(uri).toString()
  let contents = content.split("\n")
  for (let i = 0; i < contents.length; i++) {
    if (contents[i].includes(definition) && contents[i].includes(":")) {
      let start = contents[i].indexOf(definition) + definition.length
      let end = contents[i].indexOf(":")
      if (end > start && contents[i].slice(start, end).trim().length == 0) {
        let moduleName = common.getModuleName(uri)
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
  let importedModules = common.getImportedModules(uri)
  let legalLocations = locations.filter((loc) => {
    return loc.path == uri || importedModules.includes(loc.module)
  })
  return legalLocations[0]
}

module.exports = {
  findDefinitionInFiles
}