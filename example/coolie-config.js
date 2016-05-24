coolie.config({
    mainModulesDir: '/example/',
    nodeModulesDir: '/example/node_modules/',
    nodeModuleMainPath: 'src/index.js'
}).resolveModule(function (name, meta) {
    if (meta.nodeModule) {
        return coolie.resolvePath(meta.dirname, './src/index.js');
    }
}).use();