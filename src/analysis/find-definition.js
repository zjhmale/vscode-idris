const fs = require("fs")
const glob = require("glob")
const path = require("path")
const common = require('./common')

let findDefinitionForADTTypeAndFunctions = (contents, definition, uri, moduleName) => {
  for (let i = 0; i < contents.length; i++) {
    let former = contents[i - 1] ? contents[i - 1] : ""
    let latter = contents[i + 1] ? contents[i + 1] : ""
    let current = contents[i]

    if (new RegExp(`data\\s+${definition}\\s+=\\s+`, "g").test(current)
      && !current.trim().startsWith("--")) {
      return {
        path: uri,
        module: moduleName,
        line: i,
        column: current.indexOf(definition)
      }
    }

    // For the first function in ADT definition
    if (current.includes(definition)
      && new RegExp(`data\\s+\\w+\\s+=\\s+${definition}`, "g").test(former + current + latter)
      && !current.trim().startsWith("--")) {
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
    if (current.includes(definition)
      && current.includes("|")
      && !current.includes("||")
      && !current.includes(" = ")
      && !current.trim().startsWith("--")) {
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
    if (contents[i].includes(definition)
      && contents[i].includes(":")
      && !contents[i].includes("::")
      && !contents[i].trim().startsWith("--")) {
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

let getDefinitionLocations = (identifier) => {
  return common.getAllFilesExts(['idr', 'lidr']).map((file) => {
    return findDefinitionInFile(identifier, file)
  }).filter((loc) => {
    return loc != null && loc != undefined
  })
}

let findDefinitionInFiles = (identifier, uri) => {
  let locations = getDefinitionLocations(identifier)
  let importedModules = common.getImportedModules(uri)
  let legalLocations = locations.filter((loc) => {
    let reg = new RegExp("\\" + path.sep, "g")
    return loc.path.replace(reg, "/") == uri.replace(reg, "/") || importedModules.includes(loc.module)
  })
  return legalLocations[0]
}

let findDefinitionWithAliasInFiles = (identifier, alias, uri) => {
  let locations = getDefinitionLocations(identifier)
  let importedModuleAlias = common.getImportedModuleAndAlias(uri)

  let legalLocations = locations.filter((loc) => {
    let isImported = importedModuleAlias.filter(({ moduleName, aliasName }) => {
      return moduleName == loc.module && aliasName == alias
    }).length == 1
    return loc.path == uri || isImported
  })
  return legalLocations[0]
}

let findDefinitionForModule = (moduleName) => {
  return common.getAllFilesExts(['idr', 'lidr']).map((file) => {
    let content = fs.readFileSync(file).toString()
    if (new RegExp(`(>\\s+)?module\\s+${moduleName}\\s*`, "g").test(content)) {
      return {
        path: file,
        module: moduleName,
        line: 0,
        column: 0
      }
    } else {
      return null
    }
  }).filter((loc) => {
    return loc != null
  })[0]
}

module.exports = {
  findDefinitionInFiles,
  findDefinitionWithAliasInFiles,
  findDefinitionForModule
}
