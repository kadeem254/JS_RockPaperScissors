const path = require("path");
const __HWP = require("html-webpack-plugin");
const __MCEP = require("mini-css-extract-plugin");
const __WRES = require("webpack-remove-empty-scripts");

module.exports = {
  mode: "development",
  output: {
    path: path.resolve( __dirname, "dev" ),
    clean: true
  },

  devServer:{
    hot: true
  },

  entry:{
    app: {
      import: ["./src/index.js"],
      filename: "[name].bundle[contenthash].js"
    },
    index: {
      import: "./src/index.scss"
    }
  },

  module:{
    rules:[
      // SCSS and SASS files
      {
        test: /\.(scss|sass)$/i,
        use: [ __MCEP.loader, "css-loader", "sass-loader"],
      },
      // Images
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: "asset/resource"
      }
      
    ]
  },

  plugins:[
    // html plugins
    new __HWP({
      title: "RPS game",
      template: "./src/index.html",
      filename: "index.html"
    }),

    // css plugin initialization
    new __MCEP(),

    // remove empty scripts
    new __WRES(),
  ]
}