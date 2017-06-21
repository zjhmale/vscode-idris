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

// transform [[":foo", 1], [":bar", 2]] -> {"foo": 1, "bar": 2}
const keywordListToObject = kw => kw.reduce((o, v) => {  o[v[0].substring(1)] = v[1];  return o; }, {})

let IdrisHoverProvider = (function () {
  function IdrisHoverProvider() { }

  IdrisHoverProvider.prototype.provideHover = function (document, position, _token) {
    let [currentWord, wordRange] = commands.getWordBase(document, position, true)
    if (!currentWord) return

    return new Promise((resolve, _reject) => {
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
            const typeData = arg[0].msg
            const docData = arg[1].msg
            const infoMsg = []
            const typeMsg = []

            // Make an object that indexes type start character position to metadata.
            const lookupTypeDataByPos = {}
            for (const metadata of typeData[1]) {
              lookupTypeDataByPos[metadata[0]] = keywordListToObject(metadata[2])
            }

            // Idris gives us one type per line, in typeData[0].  Thus, we need to know the character index
            // of the beginning of each line, to extract its appropriate doc-overview.
            let pos = 0
            for (const line of typeData[0].split(/\n/)) {
              const typeHover = '``` idris\n' + line + '\n```\n'
              let infoHover = typeHover

              const metadata = lookupTypeDataByPos[pos]
              if (metadata) {
                const docOverview = metadata['doc-overview']
                if (docOverview) {
                  infoHover += docOverview + '\n'
                }
              }

              typeMsg.push(typeHover)
              infoMsg.push(infoHover)
              pos += line.length + 1 /* \n */
            }

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
              vscode.window.showErrorMessage("Invalid option for idris.hoverMode")
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
        return new vscode.Hover(info)
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
