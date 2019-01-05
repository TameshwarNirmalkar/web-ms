
const path = require('path')
const glob = require('glob').sync;

const packages = [
  // 'core',
  // 'shared', 
  'features'
]
const root = path.dirname(__dirname)

const srcPath = path.resolve(root, 'src')
const appPath = path.resolve(srcPath, 'app')

packages.forEach(packageName => {
  let packagePath = path.resolve(appPath, packageName)
  const files = glob('**/**/*.ts', { cwd: packagePath })
  const tsFiles = files.filter(filePath => !filePath.endsWith('.spec.ts'))
  for (let i = 0, len = tsFiles.length; i < len; i++) {
    let filePath = tsFiles[i]
    let fullFilePath = path.join(packagePath, filePath)
   console.log(`export * from './${filePath.replace('.ts', '')}'`) 
  }
})