const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// nodejs에서 export 하는 방법
module.exports = {
  mode: "development",
  entry: "./src/app.ts", // 프로젝트 시작 폴더
  output: {
    // 번들된 파일의 위치와 파일명 지정
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "inline-source-map",
  module: {
    // 다양한 유형의 모듈을 처리하는 방법을 지정할 수 있다.
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"], // ts 파일 import 시 확장자 생략 가능
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/index.html", // public/index.html 템플릿을 기반으로 빌드 결과물을 추가해줌
    }),
    new MiniCssExtractPlugin(), // CSS 파일을 별도로 분리해줌.
  ],
};
