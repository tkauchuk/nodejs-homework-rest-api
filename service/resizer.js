const Jimp = require("jimp");

const resizer = async ({ path, height, width }) => {
  const image = await Jimp.read(path);
  const resized = await image.resize(height, width);
  return await resized.writeAsync(path);
};

module.exports = resizer;
