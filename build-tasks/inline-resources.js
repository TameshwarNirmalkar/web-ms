const { readFileSync, writeFileSync, copySync } = require('fs');
const path = require('path')
const { join, dirname, resolve } = require('path')
const fs = require('fs-extra')
const sass = require('node-sass');
const eval2 = eval;

exports.inlineResource = inlineResource
exports.inlineResourcesFromString = inlineResourcesFromString
exports.inlineTemplate = inlineTemplate
exports.inlineStyles = inlineStyles
exports.buildSass = buildSass
exports.promisify = promisify

function promisify(fn) {
  return function () {
    const args = [].slice.call(arguments, 0)
    return new Promise((resolve, reject) => {
      fn.apply(this, args.concat([function (err, value) {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      }]))
    })
  }
}

function inlineResource(filePath){
  let content = readFileSync(filePath, 'utf-8')
  return inlineResourcesFromString(content, filePath)
}

function inlineResourcesFromString(content, filePath) {

  return [
    inlineComment,
    inlineTemplate,
    inlineStyles,
    removeModuleId
  ].reduce((content, fn) => fn(content, filePath), content)
}

function inlineComment(content, filePath) {
  return content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
}

function inlineTemplate(fileContent, filePath) {
  return fileContent.replace(/templateUrl:\s*'([^']+?\.html)'/g, (_match, templateUrl) => {
    const templatePath = join(dirname(filePath), templateUrl);
    const templateContent = readFileSync(templatePath, 'utf-8').replace(/([\n\r]\s*)+/gm, ' ').replace(/\$/g, '\\$');//loadResourceFile(templatePath);
    return `template: \`${templateContent}\``;
  });
}

function inlineStyles(fileContent, filePath) {
  return fileContent.replace(/styleUrls:\s*(\[[\s\S]*?])/gm, (_match, styleUrlsValue) => {
    const styleUrls = eval2(styleUrlsValue);
    const styleContents = styleUrls
      .map(url => join(dirname(filePath), url))
      .map(path => {
        let fileContent = ''
        fileContent = readFileSync(path, 'utf-8')
        fileContent = path.endsWith('.scss') ? buildSass(fileContent, path) : fileContent
        fileContent = fileContent.replace(/([\n\r]\s*)+/gm, ' ').replace(/`/g, '\\`')
        return `\`${fileContent}\``
      })

    return `styles: [${styleContents.join(',')}]`;
  });
}

function removeModuleId(content) {
  return content.replace(/\s*moduleId:\s*module\.id\s*,?\s*/gm, '')
}

function buildSass(content, sourceFile) {
  try {
    const result = sass.renderSync({
      data: content,
      file: sourceFile
    })
    return result.css.toString()
  } catch (e) {
    console.error(`at ${sourceFile}: ${e.line}: ${e.column}`)
    console.log(e.formatted)
    return ""
  }
}