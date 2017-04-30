const commands = require('../../idris/commands')
const common = require('../../analysis/common')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')

let IdrisDefinitionProvider = (function () {
  function IdrisDefinitionProvider() { }

  IdrisDefinitionProvider.prototype.provideDefinition = function (document, position, _token) {
    let [currentWord, _wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    let uri = document.uri.fsPath
    return new Promise((resolve, _reject) => {
      let currentLine = document.lineAt(position).text
      let match = common.getImportPattern().exec(currentLine + "\r\n")
      if (match && match[2].includes(currentWord)) {
        let loc = findDefinition.findDefinitionForModule(match[2])
        resolve(loc)
      } else if(/(\w+)\.(\w+)/i.test(currentWord)) {
        let match = /(\w+)\.(\w+)/i.exec(currentWord)
        let moduleAliasName = match[1].trim()
        let identifier = match[2].trim()
        let loc = findDefinition.findDefinitionWithAliasInFiles(identifier, moduleAliasName, uri)
        resolve(loc)
      } else {
        let loc = findDefinition.findDefinitionInFiles(currentWord, uri)
        resolve(loc)
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
  return IdrisDefinitionProvider
}())

module.exports = {
  IdrisDefinitionProvider
}