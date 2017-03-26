let commands = require('./idris/commands')
let controller = require('./controller')
let ipkg = require('./ipkg/ipkg')
let vscode = require('vscode')

let IdrisHoverProvider = (function () {
  function IdrisHoverProvider() { }

  IdrisHoverProvider.prototype.provideHover = function (document, position, token) {
    let currentWord = commands.getWordBase(document, position, true)
    if (!currentWord) return

    return new Promise((resolve, reject) => {
      controller.withCompilerOptions((uri) => {
        commands.getModel().load(uri).filter((arg) => {
          return arg.responseType === 'return'
        }).flatMap(() => {
          return commands.getModel().getType(currentWord)
        }).subscribe(
          function (arg) {
            resolve(arg.msg[0])
          },
          function (err) {
            if (err.warnings.length > 0) {
              resolve(err.warnings[0][3])
            } else {
              resolve(err.message)
            }
          })
      })
    }).then(function (info) {
      if (info != null) {
        return new vscode.Hover({
          language: 'idris',
          value: info
        })
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