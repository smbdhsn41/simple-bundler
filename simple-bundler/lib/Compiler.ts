import { SyncHook } from "tapable";
import Compilation from "./Compilation";
import { make, generateCode } from "./make";
import { writeFile } from "./utils";
import { resolve } from "path";
// 编译器
class Compiler {
  hooks: any;
  options: any;
  constructor(options) {
    this.hooks = Object.freeze({
      // @ts-ignore
      make: new SyncHook(["entry", "callback"]),
      // @ts-ignore
      emit: new SyncHook(["compilation", "callback"]),
    });
    this.options = options;
  }
  // 源码基本上都是内置插件注册 这里直接注册钩子
  initHooks() {
    // 编译
    this.hooks.make.tap("make", (entry, callback) => {
      const compilation = new Compilation(this);
      make(resolve(entry), compilation.modules);
      generateCode(compilation);
      callback(compilation);
    });

    this.hooks.emit.tap("emit", (compilation, callback) => {
      this.emitAssets(compilation);
      callback();
    });
  }
  // 编译
  compile() {
    this.hooks.make.call(this.options.entry, (compilation) => {
      this.hooks.emit.call(compilation, () => {
        console.log("done");
      });
    });
  }
  // 写入文件
  emitAssets(compilation) {
    writeFile(compilation);
  }
  run() {
    this.initHooks();
    this.compile();
  }
}

export default Compiler;
