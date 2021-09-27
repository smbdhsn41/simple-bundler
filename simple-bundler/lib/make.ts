import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { readFileSync } from "fs";
import { resolve, relative, dirname } from "path";
import * as babel from "@babel/core";
// 设置根目录
const projectRoot = resolve(__dirname, "..", "src");
// 获取文件相对于根目录的相对路径
function getProjectPath(path) {
  return relative(projectRoot, path).replace(/\\/g, "/");
}
// 编译代码 收集依赖
function make(entry, modules) {
  const key = getProjectPath(entry); // 文件的项目路径，如 index.js
  if (modules.find((i) => i.key === key)) {
    // 处理循环依赖
    return;
  }
  // 获取文件内容，将内容放至 modules
  let code = readFileSync(entry).toString();
  // 处理css文件
  if (/.css$/g.test(entry)) {
    code = `
         let code = ${JSON.stringify(code)};
         if (document) {
           const style = document.createElement("style");
           style.innerHTML = code;
           document.head.appendChild(style);
         }
         export default code
       `;
  }
  // es6 -> es5 主要处理esModule
  const { code: es5Code } = babel.transform(code, {
    presets: ["@babel/preset-env"],
  });
  // 初始化 modules[key]
  const item = { key, deps: [], code: es5Code };
  modules.push(item);
  // 将代码转为 AST
  const ast = parse(code, { sourceType: "module" });
  // 分析文件依赖，将内容放至 modules
  traverse(ast, {
    enter: (path) => {
      if (path.node.type === "ImportDeclaration") {
        // path.node.source.value 往往是一个相对路径，如 ./a.js，需要先把它转为一个绝对路径
        const depAbsolutePath = resolve(dirname(entry), path.node.source.value);
        // 然后转为项目路径
        const depProjectPath = getProjectPath(depAbsolutePath);
        // 把依赖写进 modules
        item.deps.push(depProjectPath);
        make(depAbsolutePath, modules);
      }
    },
  });
}
// 生成代码 思路就是把收集的代码字符串放入一个函数才可以执行
function generateCode(compilation) {
  let code = "";
  code +=
    "const depAndCode = [" +
    compilation.modules
      .map((item) => {
        const { key, deps, code } = item;
        return `{
         key: ${JSON.stringify(key)}, 
         deps: ${JSON.stringify(deps)},
         code: function(require, module, exports){
           ${code}
         }
       }`;
      })
      .join(",") +
    "];\n";
  code += "const modules = {};\n";
  code += `execute(depAndCode[0].key)\n`;
  code += `
     function execute(key) {
       if (modules[key]) { return modules[key] }
       const item = depAndCode.find(i => i.key === key)
       if (!item) { throw new Error(\`\${item} is not found\`) }
       const pathToKey = (path) => {
         const dirname = key.substring(0, key.lastIndexOf('/') + 1)
         const projectPath = (dirname + path).replace(\/\\.\\\/\/g, '').replace(\/\\\/\\\/\/, '/')
         return projectPath
       }
       const require = (path) => {
         return execute(pathToKey(path))
       }
       modules[key] = { __esModule: true }
       const module = { exports: modules[key] }
       item.code(require, module, module.exports)
       return modules[key]
     }
     `;
  compilation.assetsInfo = {
    name: compilation.outputFileName,
    source: {
      value: code,
    },
  };
}

export { make, generateCode };
