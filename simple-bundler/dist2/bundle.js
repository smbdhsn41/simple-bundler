const depAndCode = [
  {
    key: "index.js",
    deps: ["a.js", "b.js", "c.css"],
    code: function (require, module, exports) {
      "use strict";

      var _a = _interopRequireDefault(require("./a.js"));

      var _b = _interopRequireDefault(require("./b.js"));

      require("./c.css");

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      console.log(_a["default"].sum(_a["default"].value, _b["default"].value));
    },
  },
  {
    key: "a.js",
    deps: [],
    code: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;
      var module1 = {
        sum: function sum(a, b) {
          return a + b;
        },
        value: 100,
      };
      var _default = module1;
      exports["default"] = _default;
    },
  },
  {
    key: "b.js",
    deps: [],
    code: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;
      var module2 = {
        mul: function mul(a, b) {
          return a * b;
        },
        value: 100,
      };
      var _default = module2;
      exports["default"] = _default;
    },
  },
  {
    key: "c.css",
    deps: [],
    code: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;
      var code = "h1 {\n  color: red;\n}\n";

      if (document) {
        var style = document.createElement("style");
        style.innerHTML = code;
        document.head.appendChild(style);
      }

      var _default = code;
      exports["default"] = _default;
    },
  },
];
const modules = {};
execute(depAndCode[0].key);

function execute(key) {
  if (modules[key]) {
    return modules[key];
  }
  const item = depAndCode.find((i) => i.key === key);
  if (!item) {
    throw new Error(`${item} is not found`);
  }
  const pathToKey = (path) => {
    const dirname = key.substring(0, key.lastIndexOf("/") + 1);
    const projectPath = (dirname + path)
      .replace(/\.\//g, "")
      .replace(/\/\//, "/");
    return projectPath;
  };
  const require = (path) => {
    return execute(pathToKey(path));
  };
  modules[key] = { __esModule: true };
  const module = { exports: modules[key] };
  item.code(require, module, module.exports);
  return modules[key];
}
