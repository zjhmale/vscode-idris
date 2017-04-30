const commands = require('../../idris/commands')
const controller = require('../../controller')
const vscode = require('vscode')
const Rx = require('rx-lite')

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
        if (commands.tcDiagnosticCollection.has(filePath)) {
          let diagnostics = commands.tcDiagnosticCollection.get(filePath)
          diagnostics.forEach((d) => {
            if (isRangeInsideRange(wordRange, d.range)) {
              resolve(null)
            }
          })
        }

        let hoverMode = vscode.workspace.getConfiguration('idris').get('hoverMode')

        if (hoverMode == 'none') {
          resolve(null)
        }

        commands.getModel().load(uri).filter((arg) => {
          return arg.responseType === 'return'
        }).flatMap(() => {
          return Rx.Observable.zip(commands.getModel().getType(currentWord), commands.getModel().getDocs(currentWord))
        }).subscribe(
          function (arg) {
            let typeMsg = arg[0].msg[0]
            let infoMsg = arg[1].msg[0].replace(/\n    \n    /g, "").replace(/\n        \n        /g, "")
            if (hoverMode == 'info') {
              resolve(infoMsg)
            } else if (hoverMode == 'type') {
              resolve(typeMsg)
            } else if (hoverMode == 'fallback') {
              if (infoMsg) {
                resolve(infoMsg)
              } else {
                resolve(typeMsg)
              }
            } else {
              vscode.window.showErrorMessage("Invalid option for idris.hoveMode")
              resolve(null)
            }
          },
          function (err) {
            if (err.warnings && err.warnings.length > 0) {
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