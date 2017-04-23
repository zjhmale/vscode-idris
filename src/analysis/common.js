const fs = require("fs")
const glob = require("glob")
const commands = require("../idris/commands")
const _ = require('lodash')
const vscode = require('vscode')

const idrisKeywords = [
  "if",
  "then",
  "else",
  "do",
  "let",
  "in",
  "dsl",
  "impossible",
  "case",
  "of",
  "total",
  "partial",
  "mutual",
  "infix",
  "infixl",
  "infixr",
  "constructor",
  "where",
  "with",
  "syntax",
  "proof",
  "postulate",
  "using",
  "namespace",
  "rewrite",
  "public",
  "private",
  "export",
  "implicit",
  "module",
  "import",
  "auto",
  "default",
  "data",
  "codata",
  "class",
  "instance",
  "interface",
  "implementation",
  "record",
  "Type",
  "Int",
  "Nat",
  "Integer",
  "Float",
  "Char",
  "String",
  "Ptr",
  "Bits8",
  "Bits16",
  "Bits32",
  "Bits64",
  "Bool",
  "_",
  "True",
  "False",
  "Just",
  "Nothing"
]

// https://github.com/idris-lang/Idris-dev/blob/master/src/Idris/Package/Parser.hs
let ipkgKeywords = [
  "package",
  "executable",
  "main",
  "sourcedir",
  "opts",
  "pkgs",
  "modules",
  "libs",
  "objs",
  "makefile",
  "tests",
  "version",
  "readme",
  "license",
  "homepage",
  "sourceloc",
  "bugtracker",
  "brief",
  "author",
  "maintainer"
]

let getImportPattern = () => {
  return /import\s+(public\s+)?(([A-Z]\w*)(\.[A-Z]\w*)*)(\s+as\s+(\w+))?[\r\n|\n]/g
}

let getAllIdents = () => {
  let files = getAllFilesExts(['idr', 'lidr'])
  let defList = files.map((uri) => {
    return getIdents(uri).filter((name) => {
      return !/\b\d+\b/g.test(name) && !idrisKeywords.includes(name)
    }).map((name) => {
      return { name, uri }
    })
  })
  let uniIdents = _.uniqWith(_.flatten(defList), _.isEqual);
  return uniIdents
}

let identRegex = /'?[a-zA-Z0-9_][a-zA-Z0-9_-]*'?/g
let identMatch
let identList

let getIdents = (uri) => {
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

let getAllPositions = (name, uri) => {
  let positions = []
  let content = fs.readFileSync(uri).toString()
  let contents = content.split("\n")
  let regex = new RegExp(`\\b${name}\\b`, "g")
  let match
  for (let i = 0; i < contents.length; i++) {
    let current = contents[i]
    while (match = regex.exec(current)) {
      let line = i
      let column = match.index
      positions.push({ uri, line, column })
    }
  }
  return positions
}

let getModuleName = (uri) => {
  let content = fs.readFileSync(uri).toString()
  let modulePattern = /\bmodule(.*)\s+/g
  let moduleMatch = modulePattern.exec(content)
  return moduleMatch ? moduleMatch[1].trim() : null
}

let getAllModuleName = () => {
  let files = getAllFilesExts(['idr', 'lidr'])
  let moduleNames = files.map((uri) => {
    return getModuleName(uri)
  })
  return _.uniqWith(moduleNames, _.isEqual);
}

let getImportedModules = (uri) => {
  let content = fs.readFileSync(uri).toString()
  let importPattern = getImportPattern()
  let match
  let importedModules = []
  while (match = importPattern.exec(content)) {
    importedModules.push(match[2].trim())
  }
  return importedModules
}

let getImportedModuleAndAlias = (uri) => {
  let content = fs.readFileSync(uri).toString()
  let importPattern = getImportPattern()
  let match
  let importedModules = []
  while (match = importPattern.exec(content)) {
    let moduleName = match[2].trim()
    if (match[6] != undefined) {
      let aliasName = match[6].trim()
      importedModules.push({ moduleName, aliasName })
    }
  }
  return importedModules
}

let isDefinitonEqual = (def1, def2) => {
  return def1.path == def2.path
    && def1.module == def2.module
    && def1.line == def2.line
    && def1.column == def2.column
}

let getSafeRoot = () => {
  let root = vscode.workspace.rootPath
  let safeRoot = root === undefined ? "" : root
  return safeRoot
}

let getAllFiles = (ext) => {
  if (!_.isEmpty(getSafeRoot())) {
    let files = glob.sync(getSafeRoot() + "/**/*")
    return files.filter((file) => {
      return file.endsWith(`.${ext}`)
    })
  } else {
    let uri = vscode.window.activeTextEditor.document.uri.fsPath
    return [uri]
  }
}

let getAllFilesExts = (exts) => {
  let filess = exts.map((ext) => {
    return getAllFiles(ext)
  })
  return _.flatten(filess)
}

module.exports = {
  idrisKeywords,
  ipkgKeywords,
  getModuleName,
  getAllModuleName,
  getImportedModules,
  getSafeRoot,
  getAllFiles,
  getAllFilesExts,
  getIdents,
  getAllIdents,
  isDefinitonEqual,
  getAllPositions,
  getImportPattern,
  getImportedModuleAndAlias
}