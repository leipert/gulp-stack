module.exports = {
    files: {
        partials: 'app/**/*.tpl.html',
        html: 'app/*.html',
        js: 'app/**/*.js',
        css: 'app/**/*.css',
        test: 'app/**/*.spec.js',
        vendor: 'app/vendor/**/*.{css,js}',
        watch: [],
        'static': []
    },
    paths: {
        root: ['.tmp', 'app'],
        build: 'dist'
    },
    injectInto: {
        css: [],
        js: []
    },
    output: {
        js: {
            path: '/scripts',
            app: 'scripts.js',
            vendor: 'assets.js'
        },
        css: {
            path: '/styles',
            app: 'styles.css',
            vendor: 'assets.css'
        }
    },
    webserver: {
        port: 8123,
        https: false
    },
    rev: true,
    bower: false, // true or string
    templateCacheOptions: {}
};