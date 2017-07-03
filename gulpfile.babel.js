import gulp from "gulp";
import cp from "child_process";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import cssnext from "postcss-cssnext";
import BrowserSync from "browser-sync";
import sass from "gulp-sass";
import favicon from "gulp-favicons";

const browserSync = BrowserSync.create();
const hugoBin = "hugo";
const defaultArgs = ["-d", "../dist", "-s", "site", "-v"];

gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));

gulp.task("build", ["css", "favicon", "hugo"]);
gulp.task("build-preview", ["css", "favicon", "hugo-preview"]);

gulp.task("css", () => (
  gulp.src("./src/css/main.sass")
    .pipe(sass())
    .pipe(postcss([cssImport({from: "./src/css/main.css"}), cssnext()]))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

gulp.task("favicon", () => (
  gulp.src("./src/images/favicon.png")
    .pipe(favicon({
      icons: {
        appleStartup: false,         // Create Apple startup images. `boolean` or `{ offset, background }`
      }
    }))
    .pipe(gulp.dest("./dist"))
));

gulp.task("server", ["hugo", "css"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch("./src/css/**/*.{css,sass}", ["css"]);
  gulp.watch("./site/**/*", ["hugo"]);
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}
