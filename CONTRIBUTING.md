## Building and Debugging the Extension

You can set up a development environment for debugging the extension during extension development.

Clone the repo, run `npm install` and open a development instance of Code.

```bash
git clone https://github.com/zjhmale/vscode-idris.git
cd vscode-idris
npm install
code .
```

You can now go to the Debug viewlet and select `Launch Extension` then hit run (`F5`).

![debug](./images/screenshots/debug.gif)

In the `[Extension Development Host]` instance, open any folder with Idris code.

You can now hit breakpoints and step through the extension.

## Testing the Extension

In the root of the repo and run `npm test`.

```bash
npm test --silent
```

Or you can go to the Debug viewlet and select `Launch Tests` then hit run (`F5`).

![debug](./images/screenshots/test.gif)
