const path = require('path');
module.exports = {
    mode:'production',
    entry: './src/index.js',
    devServer:{
        port:3000,
        contentBase:'./dist',
        open:true
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    node: {
        fs: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ]
    },
    plugins:[
        // new htmlWebpackPlugin({
        //     template:'./src/index.html',
        //     filename:'index.html'
        // })
    ]
}

