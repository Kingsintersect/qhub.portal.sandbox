const imagemin = require("imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");

(async () => {
  const files = process.argv.slice(2);

  if (!files.length) return;

  await imagemin(files, {
    destination: "./",
    plugins: [
      mozjpeg({ quality: 70 }),
      pngquant({ quality: [0.6, 0.8] }),
    ],
  });

  console.log("✅ Images optimized");
})();