const fs = require("fs")
const glob = require("glob")
const common = require('./common')

let findDefinitionForADTTypeAndFunctions = (contents, definition, uri, moduleName) => {
  for (let i = 0; i < contents.length; i++) {
    let former = contents[i - 1] ? contents[i - 1] : ""
    let latter = contents[i + 1] ? contents[i + 1] : ""
    let current = contents[i]

    if (new RegExp(`data\\s+${definition}\\s+=\\s+`, "g").test(current)) {
      return {
        path: uri,
        module: moduleName,
        line: i,
        column: current.indexOf(definition)
      }
    }

    // For the first function in ADT definition
    if (current.includes(definition) && new RegExp(`data\\s+\\w+\\s+=\\s+${definition}`, "g").test(former + current + latter)) {
      let latterIdx = current.indexOf(definition) + definition.length
      let latterOne = current[latterIdx] ? current[latterIdx] : ""
      if (!/\w/g.test(latterOne)) {
        return {
          path: uri,
          module: moduleName,
          line: i,
          column: current.indexOf(definition)
        }
      }
    }

    // For the rest of functions in ADT definition
    if (current.includes(definition) && current.includes("|") && !contents.includes("||")) {
      let latterIdx = current.indexOf(definition) + definition.length
      let latterOne = current[latterIdx] ? current[latterIdx] : ""
      let start = current.indexOf("|") + 1
      let end = current.indexOf(definition)
      if (end > start && current.slice(start, end).trim().length == 0 && !/\w/g.test(latterOne)) {
        return {
          path: uri,
          module: moduleName,
          line: i,
          column: current.indexOf(definition)
        }
      }
    }
  }
}

/**
 * Normal functions and GADTs functions
 */
let findDefinitionForFunctions = (contents, definition, uri, moduleName) => {
  for (let i = 0; i < contents.length; i++) {
    if (contents[i].includes(definition) && contents[i].includes(":")) {
      let idx = contents[i].indexOf(definition)
      let formerOne = contents[i][idx - 1] ? contents[i][idx - 1] : ""
      let start = contents[i].indexOf(definition) + definition.length
      let end = contents[i].indexOf(":")
      if (end > start && contents[i].slice(start, end).trim().length == 0 && !/\w/g.test(formerOne)) {
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

let findDefinitionInFile = (definition, uri) => {
  let moduleName = common.getModuleName(uri)
  if (!moduleName) return

  let content = fs.readFileSync(uri).toString()
  let contents = content.split("\n")
  let funcDef = findDefinitionForFunctions(contents, definition, uri, moduleName)
  let adtTypeFuncDef = findDefinitionForADTTypeAndFunctions(contents, definition, uri, moduleName)
  return funcDef || adtTypeFuncDef
}

let findDefinitionInFiles = (definition, uri) => {
  locations = []
  common.getAllFiles('idr').forEach((file) => {
    let location = findDefinitionInFile(definition, file)
    if (location) {
      locations.push(location)
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
