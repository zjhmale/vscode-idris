let commands = require('./idris/commands')
let controller = require('./controller')
let ipkg = require('./ipkg/ipkg')
let vscode = require('vscode')

// to determine whether range1 is inside range2
let isRangeInsideRange = (range1, range2) => {
  let startPred = range1.start.line > range2.start.line ||
    (range1.start.line == range2.start.line &&
      range1.start.character >= range2.start.character)
  let endPred = range1.end.line < range2.end.line ||
    (range1.end.line == range2.end.line &&
      range1.end.character <= range2.end.character)

  return startPred && endPred
}

let IdrisHoverProvider = (function () {
  function IdrisHoverProvider() { }

  IdrisHoverProvider.prototype.provideHover = function (document, position, token) {
    let [currentWord, wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    return new Promise((resolve, reject) => {
      controller.withCompilerOptions((uri) => {
        let filePath = vscode.Uri.file(uri)
        if (commands.diagnosticCollection.has(filePath)) {
          let diagnostics = commands.diagnosticCollection.get(filePath)
          diagnostics.forEach((d) => {
            if (isRangeInsideRange(wordRange, d.range)) {
              resolve(null)
            }
          })
        }

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