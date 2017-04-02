const path = require('path')
const fs   = require('fs')
const Rx   = require('rx-lite')

let optionsRegexp   = /opts\s*=\s*\"([^\"]*)\"/
let sourcedirRegexp = /sourcedir\s*=\s*([a-zA-Z\/0-9.]+)/
let pkgsRegexp      = /pkgs\s*=\s*([a-zA-Z\/0-9., ]+)/

let findIpkgFile = (directory) => {
  let readDir = Rx.Observable.fromNodeCallback(fs.readdir)
  let r = readDir(directory)
  return r.map((files) => {
    return files.map((file) => {
      return {
        file: file,
        directory: directory,
        path: path.join(directory, file),
        ext: path.extname(file)
      }
    }).filter((file) => {
      return file.ext === '.ipkg'
    })
  })
}

let parseIpkgFile = (fileInfo) => {
  return (fileContents) => {
    let optionsMatches = fileContents.match(optionsRegexp)
    let sourcedirMatches = fileContents.match(sourcedirRegexp)
    let pkgsMatches = fileContents.match(pkgsRegexp)
    let compilerOptions = {}
    if (optionsMatches) {
      compilerOptions.options = optionsMatches[1]
    }
    compilerOptions.pkgs = pkgsMatches ? pkgsMatches[1].split(',').map((s) => {
      return s.trim()
    }) : []
    compilerOptions.src = sourcedirMatches ? path.join(fileInfo.directory, sourcedirMatches[1]) : fileInfo.directory
    return compilerOptions
  }
}

let readIpkgFile = (ipkgFile) => {
  let readFile = Rx.Observable.fromNodeCallback(fs.readFile)
  return readFile(ipkgFile.path, {
    encoding: 'utf8'
  })
}

compilerOptions = (directory) => {
  let ipkgFilesObserver = findIpkgFile(directory)
  return ipkgFilesObserver.flatMap((ipkgFiles) => {
    if (ipkgFiles.length) {
      let ipkgFile = ipkgFiles[0]
      return readIpkgFile(ipkgFile).map(parseIpkgFile(ipkgFile))
    } else {
      return Rx.Observable["return"]({})
    }
  })["catch"](() => {
    return Rx.Observable["return"]({})
  })
}

let getPkgOpts = (compilerOptions) => {
  let pkgs = compilerOptions.pkgs && compilerOptions.pkgs.length
    ? [].concat.apply([], compilerOptions.pkgs.map((p) => {
      return ["-p", p]
    }))
    : []

  let pkgOpts = pkgs.concat(compilerOptions.options ? compilerOptions.options.split(' ') : [])
  return pkgOpts
}

module.exports = {
  findIpkgFile: findIpkgFile,
  readIpkgFile: readIpkgFile,
  compilerOptions: compilerOptions,
  getPkgOpts: getPkgOpts
}
