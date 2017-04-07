const commands = require('../idris/commands')
const controller = require('../controller')
const vscode = require('vscode')
const common = require('../analysis/common')
const findDefinition = require('../analysis/find-definition')
const Rx = require('rx-lite')
const HashMap = require('hashmap')
const _ = require('lodash')

let uniIdents = []

const excludes = [
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

let buildSymbolSearchList = () => {
  let files = common.getAllFiles('idr')
  let defList = files.map((uri) => {
    return common.getIdentList(uri).filter((name) => {
      return !/\b\d+\b/g.test(name) && !excludes.includes(name)
    }).map((name) => {
      return { name, uri }
    })
  })
  uniIdents = _.uniqWith(_.flatten(defList), _.isEqual);
}

let IdrisWorkspaceSymbolProvider = (function () {
  function IdrisWorkspaceSymbolProvider() { }

  IdrisWorkspaceSymbolProvider.prototype.provideWorkspaceSymbols = function (query, token) {
    return new Promise((resolve, reject) => {
      buildSymbolSearchList()
      let defs = uniIdents.filter(({ name, _ }) => {
        return query != "" && (name.toLowerCase().includes(query) || name.includes(query))
      }).map(({ name, uri }) => {
        let def = findDefinition.findDefinitionInFiles(name, uri)
        return { name, def }
      }).filter((i) => i.def != undefined)
      let uniDefs = _.uniqWith(_.flatten(defs), _.isEqual);
      let symbols = uniDefs.map(({ name, def }) => {
        let pos = new vscode.Position(def.line, def.column);
        let range = new vscode.Range(pos, pos);
        let info = new vscode.SymbolInformation(
          name,
          vscode.SymbolKind.Function,
          range,
          vscode.Uri.file(def.path),
          ""
        )
        return info
      })
      resolve(symbols)
    }).then(function (symbols) {
      return symbols
    })
  }
  return IdrisWorkspaceSymbolProvider
}())

module.exports = {
  IdrisWorkspaceSymbolProvider
}