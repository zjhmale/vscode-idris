const commands = require('../idris/commands')
const controller = require('../controller')
const vscode = require('vscode')
const common = require('../analysis/common')
const findDefinition = require('../analysis/find-definition')
const Rx = require('rx-lite')
const HashMap = require('hashmap')

let IdrisWorkspaceSymbolProvider = (function () {
  let symbolMap = new HashMap()
  function IdrisWorkspaceSymbolProvider() { }

  IdrisWorkspaceSymbolProvider.prototype.provideWorkspaceSymbols = function (query, token) {
    let files = common.getAllFiles('idr')

    return new Promise((resolve, reject) => {
      controller.withCompilerOptions((_) => {
        let subjects = files.map((file) => {
          let moduleName = common.getModuleName(file)
          if (!moduleName) {
            return null
          } else {
            return commands.getModel().load(file).filter((arg) => {
              return arg.responseType === 'return'
            }).flatMap(() => {
              return commands.getModel().browseNamespace(moduleName)
            })
          }
        }).filter((subject) => subject != null)

        Rx.Observable.concat(subjects).subscribe(
          function (arg) {
            arg.msg[0][1].forEach((a) => {
              let name = a[0].split(":")[0].trim()
              let namespace = a[1][0][2][5][1]
              let uri = commands.getModel().compilerOptions.src + "/" + namespace.replace(".", "/") + ".idr"
              symbolMap.set(`${namespace} |> ${name}`, [name, uri])
            })
            let symbols = symbolMap.values().map((sym) => {
              let [name, uri] = sym
              if (name.toLowerCase().startsWith(query)) {
                let def = findDefinition.findDefinitionInFiles(name, uri)
                if (def) {
                  let pos = new vscode.Position(def.line, def.column);
                  let range = new vscode.Range(pos, pos);
                  let info = new vscode.SymbolInformation(
                    name,
                    vscode.SymbolKind.Function,
                    range,
                    vscode.Uri.file(uri),
                    ""
                  )
                  return info
                } else {
                  return null
                }
              } else {
                return null
              }
            }).filter((info) => info != null)
            resolve(symbols)
          })
      })
    }).then(function (symbols) {
      return symbols
    })
  }
  return IdrisWorkspaceSymbolProvider
}())

module.exports = {
  IdrisWorkspaceSymbolProvider
}