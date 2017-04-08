const ipkg = require('../ipkg/ipkg')
const commands = require('../idris/commands')
const controller = require('../controller')
const vscode = require('vscode')
const common = require('../analysis/common')
const findDefinition = require('../analysis/find-definition')

let IdrisDefinitionProvider = (function () {
  function IdrisDefinitionProvider() { }

  IdrisDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
    let [currentWord, wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    let uri = document.uri.fsPath
    return new Promise((resolve, reject) => {
      let currentLine = document.lineAt(position).text
      let match = common.getImportPattern().exec(currentLine + "\r\n")
      if (match && match[2].includes(currentWord)) {
        let loc = findDefinition.findDefinitionForModule(match[2])
        resolve(loc)
      } else {
        let loc = findDefinition.findDefinitionInFiles(currentWord, uri)
        resolve(loc)
      }
    }).then(function (loc) {
      if (loc) {
        let pos = new vscode.Position(loc.line, loc.column);
        return new vscode.Location(vscode.Uri.file(loc.path), pos);
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