let ipkg = require('../ipkg/ipkg')
let commands = require('../idris/commands')
let controller = require('../controller')
let vscode = require('vscode')
let findDefinition = require('../analysis/find-definition')

let IdrisDefinitionProvider = (function () {
  function GoDefinitionProvider() { }

  GoDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
    let [currentWord, wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    let uri = document.uri.fsPath
    return controller.getCompilerOptsPromise().flatMap((compilerOptions) => {
      commands.initialize(compilerOptions)
      return commands.getModel().load(uri).filter((arg) => {
        return arg.responseType === 'return'
      }).flatMap(() => {
        return commands.getModel().getType(currentWord)
      })
    }).toPromise().then((arg) => {
      let typeMsg = arg.msg[0]
      // typeMsg here is => name : type
      let loc = findDefinition.findDefinitionInFiles(typeMsg, uri)
      if (loc) {
        let pos = new vscode.Position(loc.line, loc.column);
        return new vscode.Location(vscode.Uri.file(loc.path), pos);
      } else {
        return null
      }
    })
  }
  return GoDefinitionProvider
}())

module.exports = {
  IdrisDefinitionProvider
}