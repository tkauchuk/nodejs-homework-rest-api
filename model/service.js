const fs = require('fs/promises');

const renewFile = async (path, data) => {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
}

module.exports = renewFile;