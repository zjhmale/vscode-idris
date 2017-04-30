const commands = require('../../idris/commands')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')

let IPKGDefinitionProvider = (function () {
  function IPKGDefinitionProvider() { }

  IPKGDefinitionProvider.prototype.provideDefinition = function (document, position, _token) {
    let [currentWord, _wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    return new Promise((resolve, _reject) => {
      let match = /^(([A-Z]\w*)(\.[A-Z]\w*)*)$/g.exec(currentWord)
      if (match) {
        let loc = findDefinition.findDefinitionForModule(currentWord)
        resolve(loc)
      } else {
        resolve(null)
      }
    }).then(function (loc) {
      if (loc) {
        let pos = new vscode.Position(loc.line, loc.column)
        return new vscode.Location(vscode.Uri.file(loc.path), pos)
      } else {
        return null
      }
    })
  }
  return IPKGDefinitionProvider
}())

module.exports = {
  IPKGDefinitionProvider
}