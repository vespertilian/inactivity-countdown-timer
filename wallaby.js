module.exports = function (wallaby) {
    return {
        files: [
            'src/**/*.ts',
            '!src/demo.ts',
            '!src/main.ts'
        ],
        tests: [
            'tests/**/*.spec.ts'
        ],
        testFramework: 'jasmine',
        trace: true
    };
};
