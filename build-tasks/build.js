const path = require('path')
const glob = require('glob').sync;
const spawn = require('child_process').spawnSync
const fs = require('fs-extra')

const {removeSync, ensureDirSync, copySync, readFileSync, writeFileSync} = fs
const {join, resolve, dirname} = path

const {inlineResource} = require('./inline-resources')

const root = path.dirname(__dirname)
const tmpPath = path.resolve(root, './tmp')
const nodeModulePath = path.resolve(root, './node_modules')
const srcPath = path.resolve(root, 'src')
const outPath = path.resolve(root, 'build-out')
const libPath = path.resolve(tmpPath, 'lib')
const packages = ['core', 'shared', 'features']

init()

function init() {
  console.log({root, tmpPath})
  removeSync(path.resolve(root, 'node_modules/@srk'))
  removeSync(tmpPath)
  ensureDirSync(libPath)
  // ensureDirSync(path.resolve(tmpPath, 'assets/'))
  // copySync(path.resolve(srcPath, 'assets'), path.resolve(tmpPath, 'assets/'))
  copySync(path.resolve(root, 'build-tasks/tsconfig.json'), path.resolve(libPath, 'tsconfig.json'))
  
  packages.forEach(packageName => {
    let packagePath = path.resolve(libPath, packageName)
    console.log(packagePath)
    ensureDirSync(packagePath)
    copySync(path.resolve(srcPath, 'app', packageName), packagePath)
    const files = glob('**/**/*.component.ts', {cwd: packagePath})

    for(let i = 0, len=files.length; i < len; i++){
      let filePath = files[i]
      let fullFilePath = join(packagePath, filePath)
      
      try {
        let source = inlineResource(fullFilePath)
        writeFileSync(fullFilePath, source)
      } catch(e){
        console.error(e)
        process.exit(-1)
      }
      
    }
  })

  ngcBuild(path.resolve(libPath, 'tsconfig.json'))

  packages.forEach(packageName => {
    let packagePath = path.resolve(libPath, packageName)
    let buildPackagePath = path.resolve(tmpPath, `build/${packageName}`)
    let buildPackageJSONPath = path.resolve(buildPackagePath, 'package.json')
    let pkgJSON = `
      {
        "name": "@srk/${packageName}",
        "version": "1.0.0",
        "description": "",
        "author": "",
        "license": "ISC"
      }
    `
    ensureDirSync(buildPackagePath)
    writeFileSync(buildPackageJSONPath, pkgJSON)
    const patterns = ['**/**/*.d.ts', '**/**/*.js', '**/**/*.js.map', '**/**/*.metadata.json']
    patterns.forEach(pattern => {
      console.log('pattern', pattern)
      const files = glob(pattern, {cwd: packagePath})
      for(let i = 0, len = files.length; i < len; i++){
        let filePath = files[i]
        let fullFilePath = join(packagePath, filePath)
        let buildFilePath = join(buildPackagePath, filePath)
        console.log('buildFilePath', buildFilePath)
        ensureDirSync(dirname(buildFilePath))
        copySync(fullFilePath, buildFilePath)
      }
    })
    
  })

  
}

function ngcBuild(tsConfigPath) {
  return execNode('@angular/compiler-cli', 'ngc', ['-p', tsConfigPath]);
}

function execNode(packageName, executable, args) {
  let binPath = resolveBin(packageName, executable)
  exec('node', [binPath].concat(args))
}

function exec(binPath, args) {
  const res = spawn(binPath, args)
  // console.log(res)
  if (res.stderr) {
    console.log('error', String(res.stderr))
  }
  if (res.stdout) {
    // console.log('data', String(res.stdout))
  }

}

function resolveBin(name, executable) {
  const mod = require.resolve(name);
  const pack = require(path.resolve(path.dirname(mod), 'package.json'))
  let binfield = pack.bin;
  let binpath = typeof binfield === 'object' ? binfield[executable] : binfield;

  return path.resolve(path.dirname(mod), binpath)
}

