const common = require('../../analysis/common')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')
const _ = require('lodash')

let IdrisWorkspaceSymbolProvider = (function () {
  function IdrisWorkspaceSymbolProvider() { }

  IdrisWorkspaceSymbolProvider.prototype.provideWorkspaceSymbols = function (query, token) {
    return new Promise((resolve, reject) => {
      let uniIdents = common.getAllIdents()
      let defs = uniIdents.filter(({ name, _ }) => {
        return query != "" && (name.toLowerCase().includes(query) || name.includes(query))
      }).map(({ name, uri }) => {
        let def = findDefinition.findDefinitionInFiles(name, uri)
        return { name, def }
      }).filter((i) => {
        return i.def != undefined
      })
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
    })
  }
  return IdrisWorkspaceSymbolProvider
}())

module.exports = {
  IdrisWorkspaceSymbolProvider
}