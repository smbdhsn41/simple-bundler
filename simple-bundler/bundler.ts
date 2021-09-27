/**
 * 简单实现打包思路 不涉及Compiler Compilation等实现
 * 总结思路：入口文件出发，读取文件内容经过babel处理后变成es5代码保存到code字段，
 * babel处理获取import字段获取路径标志为依赖，
 * 然后就是执行generateCode函数
 *
 * generateCode函数：编辑成字符串写入文件，这样读取到代码放到function里就可以执行了。
 *
 * 如何处理css？css-> js
 *
 * path模块方法简单介绍: https://www.cnblogs.com/chyingp/p/node-learning-guide-path.html
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { writeFileSync, readFileSync } from "fs";
import { resolve, relative, dirname } from "path";
import * as babel from "@babel/core";

// 设置根目录
const projectRoot = resolve(__dirname, "src");
// 类型声明
type modules = { key: string; deps: string[]; code: string }[];
// 初始化一个空的 modules，用于收集依赖
const depAndCode: modules = [];

// 将入口文件的绝对路径传入函数
make(resolve(projectRoot, "index.js"));
// 生成代码写入文件
writeFileSync("./dist2/bundle.js", generateCode());

console.log("done");

function generateCode() {
  let code = "";
  code +=
    "const depAndCode = [" +
    depAndCode
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
  return code;
}
// 编译阶段  webpack中make钩子表示编译等开始
function make(filepath: string) {
  const key = getProjectPath(filepath); // 文件的项目路径，如 index.js
  if (depAndCode.find((i) => i.key === key)) {
    // 处理循环依赖
    return;
  }
  // 获取文件内容，将内容放至 modules
  let code = readFileSync(filepath).toString();
  // 处理css文件
  if (/.css$/g.test(filepath)) {
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
  depAndCode.push(item);
  // 将代码转为 AST
  const ast = parse(code, { sourceType: "module" });
  // 分析文件依赖，将内容放至 modules
  traverse(ast, {
    enter: (path) => {
      if (path.node.type === "ImportDeclaration") {
        // path.node.source.value 往往是一个相对路径，如 ./a.js，需要先把它转为一个绝对路径
        const depAbsolutePath = resolve(
          dirname(filepath),
          path.node.source.value
        );
        // 然后转为项目路径
        const depProjectPath = getProjectPath(depAbsolutePath);
        // 把依赖写进 modules
        item.deps.push(depProjectPath);
        make(depAbsolutePath);
      }
    },
  });
}
// 获取文件相对于根目录的相对路径
function getProjectPath(path: string) {
  return relative(projectRoot, path).replace(/\\/g, "/");
}
