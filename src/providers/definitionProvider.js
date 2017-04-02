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

    let uri = document.uri.fsPath
    return new Promise((resolve, reject) => {
      let loc = findDefinition.findDefinitionInFiles(`${currentWord} :`, uri)
      console.log(JSON.stringify(loc))
      resolve(loc)
    }).then(function (loc) {
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