let commands = require('./idris/commands')
let ipkg = require('./ipkg/ipkg')
let vscode = require('vscode')

let IdrisHoverProvider = (function () {
  function IdrisHoverProvider() { }

  IdrisHoverProvider.prototype.provideHover = function (document, position, token) {
    let uri = document.uri.path
    let currentWord = commands.getWordBase(document, position)
    if (!currentWord) return

    let root = vscode.workspace.rootPath
    let safeRoot = root === undefined ? "" : root
    let compilerOptions = ipkg.compilerOptions(safeRoot)

    return new Promise((resolve, reject) => {
      compilerOptions.subscribe((compilerOptions) => {
        commands.initialize(compilerOptions)
        commands.getModel().load(uri).filter((arg) => {
          return arg.responseType === 'return'
        }).flatMap(() => {
          return commands.getModel().getType(currentWord)
        }).subscribe(
          function (arg) {
            resolve(arg.msg[0])
          },
          function (err) {
            resolve(err.message)
          })
      })
    }).then(function (info) {
      if (info != null) {
        return new vscode.Hover(info)
      } else {
        return null
      }
    })
  }
  return IdrisHoverProvider
}())

module.exports = {
  IdrisHoverProvider
}