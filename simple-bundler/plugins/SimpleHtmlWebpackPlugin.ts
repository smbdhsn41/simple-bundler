import { writeFileSync } from "fs";
import { resolve } from "path";
class SimpleHtmlWebpackPlugin {
  constructor() {}
  apply(compiler) {
    compiler.hooks.emit.tap(
      "SimpleHtmlWebpackPlugin",
      (compilation, callback) => {
        let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <script src="./${compilation.outputFileName}"></script>
        </head>
        <body>
            <h1>hello webpack</h1>
        </body>
        </html>
      `;
        // 因为不是真正的webpack调用所以直接写入html htmlwebpackplugin并不是这样做的
        writeFileSync(resolve(compilation.outputPath, "index.html"), html);
        callback();
      }
    );
  }
}

export default SimpleHtmlWebpackPlugin;
