const fs = require("fs");
const path = require("path");
const {
    parse
} = require("@babel/parser");
const babel = require("@babel/core");
const traverse = require("@babel/traverse").default;

let MODULEID = 0;

let MODULE = {};


const config = {
    entry: 'src/main.js',
    output: {
        dirName: 'dist',
        fileName: 'build.js',
    }
}

// 1.处理模块生成模块对象
function generateMoudle(filePath) {
    let dependces = [];

    const originCode = fs.readFileSync(filePath, {
        encoding: "UTF-8",
    });

    const ast = parse(originCode, {
        sourceType: "module",
    });

    traverse(ast, {
        ImportDeclaration({
            node
        }) {
            // 将相对路径修改为绝对路径
            const src = path.join("src", node.source.value);
            node.source.value = src;
            dependces.push(src);
        },
    });

    const {
        code
    } = babel.transformFromAstSync(ast, undefined, {
        presets: ["@babel/preset-env"],
    });
    //   console.log("code", code);

    return {
        filePath,
        moduleId: MODULEID++,
        fn: `function fn(require, module, exports) {${code}}`,
        dependces,
    };
}

// 2.处理模块依赖图
function generateGraph(path) {
    const mainModule = generateMoudle(path);
    let qeue = [mainModule];
    MODULE[mainModule.filePath] = mainModule;
    for (let module of qeue) {
        for (let dependce of module.dependces) {
            // 避免重复生成模块对象
            if (!MODULE[dependce]) {
                MODULE[dependce] = generateMoudle(dependce);
                qeue.push(MODULE[dependce]);
            }
        }
    }

    return qeue;
}

// 3.生成代码
function generateBuild(entry) {
    const graph = generateGraph(entry);
    let modules = '';
    graph.forEach(module => {
        modules += `'${module.filePath}': ${module.fn},`
    });

    return `(function (modules, entry) {

        function require(path) {
            
            const module = {
                exports: {},
            };

            const exports = module.exports;

            modules[path](require, module, exports);

            return exports;
        }
        require(entry);
    })({${modules}}, '${entry}');`
}

// 4.写入文件
function writeFile() {
    const {
        entry,
        output
    } = config;
    const code = generateBuild(entry);
    if (!fs.existsSync(output.dirName)) {
        fs.mkdirSync(output.dirName);
    }
    fs.writeFileSync(path.join('./', output.dirName, output.fileName), code)
}

writeFile();