let ipkg = require('../ipkg/ipkg')
let commands = require('../idris/commands')
let controller = require('../controller')
let vscode = require('vscode')

let findDefinition = (name) => { }

let IdrisDefinitionProvider = (function () {
  function GoDefinitionProvider() { }

  GoDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
    let [currentWord, wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    return controller.getCompilerOptsPromise().flatMap((compilerOptions) => {
      commands.initialize(compilerOptions)
      return commands.getModel().load(document.uri.fsPath).filter((arg) => {
        return arg.responseType === 'return'
      }).flatMap(() => {
        return commands.getModel().getType(currentWord)
      })
    }).toPromise().then((arg) => {
      let typeMsg = arg.msg[0]
      console.log(typeMsg)
      let pos = new vscode.Position(37, 10);
			return new vscode.Location(vscode.Uri.file(document.uri.fsPath), pos);
    })
  }
  return GoDefinitionProvider
}())

module.exports = {
  IdrisDefinitionProvider
}