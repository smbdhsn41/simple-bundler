import { writeFileSync } from "fs";
import { resolve } from "path";
function writeFile(compilation) {
  writeFileSync(
    resolve(compilation.outputPath, compilation.outputFileName),
    compilation.assetsInfo.source.value
  );
}

export { writeFile };
