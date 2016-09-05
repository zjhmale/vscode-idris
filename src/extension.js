let vscode          = require('vscode')
let controller      = require('./controller')

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

    controller.getCommands().forEach(([key, value]) => {
        let disposable = vscode.commands.registerCommand(key, value)
        context.subscriptions.push(disposable)
    })
}
exports.activate = activate

function deactivate() {
}
exports.deactivate = deactivate
