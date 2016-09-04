let vscode       = require('vscode')
let IdrisIdeMode = require('./ide-mode')

function activate(context) {
    vscode.languages.setLanguageConfiguration("idris", {
        indentationRules: {
            decreaseIndentPattern: /[\]})][ \t]*$/m,
            increaseIndentPattern: /((\b(if\b.*|then|else|do|of|let|in|where))|=|->|>>=|>=>|=<<|(^(data)( |\t)+(\w|')+( |\t)*))( |\t)*$/
        },

        comments: {
            lineComment: "--",
            blockComment: ["{-", "-}"]
        },

        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"]
        ]
    })
}
exports.activate = activate

function deactivate() {
}
exports.deactivate = deactivate
