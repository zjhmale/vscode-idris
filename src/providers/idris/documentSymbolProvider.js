const commands = require('../../idris/commands')
const controller = require('../../controller')
const common = require('../../analysis/common')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')

let IdrisDocumentSymbolProvider = (function () {
  function IdrisDocumentSymbolProvider() { }

  IdrisDocumentSymbolProvider.prototype.provideDocumentSymbols = function (document, token) {
    return new Promise((resolve, reject) => {
      controller.withCompilerOptions((uri) => {
        let moduleName = common.getModuleName(uri)
        if (!moduleName) resolve(null)

        commands.getModel().load(uri).filter((arg) => {
          return arg.responseType === 'return'
        }).flatMap(() => {
          return commands.getModel().browseNamespace(moduleName)
        }).subscribe(
          function (arg) {
            let symbols = []
            arg.msg[0][1].forEach((a) => {
              let name = a[0].split(":")[0].trim()
              let def = findDefinition.findDefinitionInFiles(name, uri)
              if (def) {
                let pos = new vscode.Position(def.line, def.column);
                let loc = new vscode.Location(vscode.Uri.file(def.path), pos);
                let info = new vscode.SymbolInformation(
                  name,
                  vscode.SymbolKind.Function,
                  "",
                  loc
                )
                symbols.push(info)
              }
            })
            resolve(symbols)
          },
          function (err) {
            vscode.window.showWarningMessage(`${err.message} : ${moduleName}`)
            resolve(null)
          })
      })
    })
  }
  return IdrisDocumentSymbolProvider
}())

module.exports = {
  IdrisDocumentSymbolProvider
}