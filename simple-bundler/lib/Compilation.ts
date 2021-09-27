// 表示一次编译过程
class Compilation {
  assetsInfo: {};
  modules: any[];
  outputFileName: string;
  outputPath: string;
  constructor(compiler) {
    this.assetsInfo = {}; //  存储生成后的代码
    this.modules = []; // 分析的模块集合
    const { filename, path } = compiler.options.output;
    this.outputFileName = filename;
    this.outputPath = path;
  }
}

export default Compilation;
