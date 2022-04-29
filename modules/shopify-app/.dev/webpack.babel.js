import path from 'path'

// webpack
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'

const ROOT_DIR = path.join(__dirname, '..')

const PUBLIC_PATH = process.env.PUBLIC_PATH || '/'

export default {
  // mode: process.env.NODE_ENV,
  mode: 'production',
  output: {
    publicPath: PUBLIC_PATH,
    path: path.join(ROOT_DIR, '.dist'),
    filename: 'js/[name].[hash:6].js'
  },
  entry: {
    app: [
      path.join(ROOT_DIR, 'src/client/app/index.js')
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      dry: false,
      dangerouslyAllowCleanPatternsOutsideProject: true
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:6].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'app.ect',
      template: path.join(ROOT_DIR, 'src/client/app/index.ect')
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash:6].css'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ].filter(Boolean),
  resolve: {
    extensions: [ '.js', '.jsx', '.css' ],
    modules: [
      'node_modules',
      'src/client',
      'src'
    ],
    alias: {
      '@': path.join(ROOT_DIR, 'src/client')
    }
  },
  module: {
    rules: [
      {
        test: /\.ect$/,
        use: {
          loader: 'html-loader'
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-optional-chaining'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [ {
          loader: MiniCssExtractPlugin.loader
        }, {
          loader: 'css-loader'
        } ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[hash:6].[ext]',
              context: 'src/client/images'
            }
          }
        ]
      }
    ]
  }
}
