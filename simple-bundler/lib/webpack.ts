import Compiler from "./Compiler";

const webpack = (options) => {
  function createCompiler() {
    const compiler = new Compiler(options);
    // 注册插件
    if (options.plugins && options.plugins.length > 0) {
      for (const plugin of options.plugins) {
        plugin.apply(compiler);
      }
    }
    compiler.run();
  }
  return createCompiler();
};

export default webpack;
