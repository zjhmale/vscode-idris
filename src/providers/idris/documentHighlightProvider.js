const commands = require('../../idris/commands')
const common = require('../../analysis/common')
const findDefinition = require('../../analysis/find-definition')
const vscode = require('vscode')
const _ = require('lodash')

let IdrisDocumentHighlightProvider = (function () {
  function IdrisDocumentHighlightProvider() { }

  IdrisDocumentHighlightProvider.prototype.provideDocumentHighlights = function (document, position, _token) {
    let [currentWord, _wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    console.log(currentWord)
    let uri = document.uri.fsPath
    let currentWordDef = findDefinition.findDefinitionInFiles(currentWord, uri)

    if (currentWordDef != undefined) {
      return new Promise((resolve, _reject) => {
        let uniIdents = common.getIdents(uri)
        let positions = uniIdents.filter((name) => {
          if (name == currentWord) {
            let def = findDefinition.findDefinitionInFiles(name, uri)
            if (def == undefined) {
              return false
            } else {
              return common.isDefinitonEqual(currentWordDef, def)
            }
          } else {
            return false
          }
        }).map((name) => {
          return common.getAllPositions(name, uri)
        })
        let uniPositions = _.uniqWith(_.flatten(positions), _.isEqual)
        let highlights = uniPositions.map(({ _uri, line, column }) => {
          let startPos = new vscode.Position(line, column)
          let endPos = new vscode.Position(line, column + currentWord.length)
          let range = new vscode.Range(startPos, endPos)
          return new vscode.DocumentHighlight(range, vscode.DocumentHighlightKind.Text)
        })
        resolve(highlights)
      })
    } else {
      return common.getAllPositions(currentWord, uri).map(({ _uri, line, column }) => {
        let startPos = new vscode.Position(line, column)
        let endPos = new vscode.Position(line, column + currentWord.length)
        let range = new vscode.Range(startPos, endPos)
        return new vscode.DocumentHighlight(range, vscode.DocumentHighlightKind.Text)
      })
    }
  }
  return IdrisDocumentHighlightProvider
}())

module.exports = {
  IdrisDocumentHighlightProvider
}