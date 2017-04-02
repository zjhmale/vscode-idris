const ipkg = require('../ipkg/ipkg')
const commands = require('../idris/commands')
const controller = require('../controller')
const vscode = require('vscode')
const findDefinition = require('../analysis/find-definition')

let IdrisDefinitionProvider = (function () {
  function GoDefinitionProvider() { }

  GoDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
    let [currentWord, wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    commands.showOutputChannel(`Searching for the definition of ${currentWord} ...`)
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
      commands.clearOutputChannel()
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