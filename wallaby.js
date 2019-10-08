module.exports = function (wallaby) {
    return {
        files: [
            { pattern: 'src/**/*.ts', load: false },
            { pattern: '!src/demo.ts', load: false },
            { pattern: '!src/main.ts', load: false }
        ],
        tests: [
            { pattern: 'tests/**/*.spec.ts', load: false }
        ],
        testFramework: 'jasmine',
        postprocessor: wallaby.postprocessors.webpack({
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        exclude: /node_modules/,
                        use: [
                            { loader: 'ts-loader', options: { transpileOnly: true } },
                        ]
                    }
                ]
            },
            resolve: {
                extensions: ['.js', '.ts']
            }
        }),
        setup: function () {
            window.__moduleBundler.loadTests();
        }
    };
};
