const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: './src/main.jsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[contenthash].js',
      clean: true,
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.json$/,
          type: 'asset/source',
          generator: {
            dataUrl: content => {
              return content;
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      fallback: {
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer/"),
        "os": require.resolve("os-browserify/browser"),
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "assert": require.resolve("assert/"),
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      }),
      // Define plugin to provide global constants
      new webpack.DefinePlugin({
        'process.env.CONTRACT_ADDRESS_SEPOLIA': JSON.stringify('0xd9145CCE52D386f254917e481eB44e9943F39138'),
        'process.env.CHAIN_ID_SEPOLIA': JSON.stringify('11155111'),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      hot: true,
      historyApiFallback: true,
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
  };
};
