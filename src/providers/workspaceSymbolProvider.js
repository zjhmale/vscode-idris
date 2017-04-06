const commands = require('../idris/commands')
const controller = require('../controller')
const vscode = require('vscode')
const common = require('../analysis/common')
const findDefinition = require('../analysis/find-definition')
const Rx = require('rx-lite')
const HashMap = require('hashmap')
const _ = require('lodash')

let uniDefList = []

let buildSymbolSearchList = () => {
  let files = common.getAllFiles('idr')
  let defList = files.map((uri) => {
    return common.getIdentList(uri).map((name) => {
      let def = findDefinition.findDefinitionInFiles(name, uri)
      if (def) {
        let pos = new vscode.Position(def.line, def.column);
        let range = new vscode.Range(pos, pos);
        let info = new vscode.SymbolInformation(
          name,
          vscode.SymbolKind.Function,
          range,
          vscode.Uri.file(def.path),
          ""
        )
        return { name, info }
      } else {
        return null
      }
    }).filter((i) => i != null)
  })
  uniDefList = _.uniqWith(_.flatten(defList), _.isEqual);
}

let IdrisWorkspaceSymbolProvider = (function () {
  function IdrisWorkspaceSymbolProvider() { }

  IdrisWorkspaceSymbolProvider.prototype.provideWorkspaceSymbols = function (query, token) {
    return new Promise((resolve, reject) => {
      buildSymbolSearchList()
      let symbols = uniDefList.map((def) => {
        if (def.name.toLowerCase().startsWith(query)
          || def.name.startsWith(query)) {
          return def.info
        } else {
          return null
        }
      }).filter((info) => info != null)
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