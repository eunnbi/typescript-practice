const path = require("path");

// nodejs에서 export 하는 방법
module.exports = {
  mode: "development",
  entry: "./src/app.ts", // 프로젝트 시작 폴더
  output: {
    // 번들된 파일의 위치와 파일명 지정
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "dist",
  },
  devtool: "inline-source-map",
  module: {
    // 프로젝트 내에서 다양한 모듈을 처리하는 방법을 지정할 수 있다.
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
