({
    appDir: "./test/scripts",
    baseUrl: "./",
    optimize: "none",
    findNestedDependecies: true,
    dir: "scripts-prod",
    paths: {
        css: "martcss",
        text: "text"
    },
    modules: [
        { name: "test-module" }
    ]
})
