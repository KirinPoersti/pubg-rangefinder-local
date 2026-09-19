const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const chunksDir = path.join(projectRoot, 'asset-chunks');

const assets = [
  ['pubg-bg.jpg', 'src/assets/img/pubg-bg.jpg'],
  ['Deston_Main_High_Res.jpg', 'src/assets/img/maps/Deston_Main_High_Res.jpg'],
  ['Erangel_Main_High_Res.jpg', 'src/assets/img/maps/Erangel_Main_High_Res.jpg'],
  ['Miramar_Main_High_Res.jpg', 'src/assets/img/maps/Miramar_Main_High_Res.jpg'],
  ['Rondo_Main_High_Res.jpg', 'src/assets/img/maps/Rondo_Main_High_Res.jpg'],
  ['Sanhok_Main_High_Res.jpg', 'src/assets/img/maps/Sanhok_Main_High_Res.jpg'],
  ['Taego_Main_High_Res.jpg', 'src/assets/img/maps/Taego_Main_High_Res.jpg'],
  ['Vikendi_Main_High_Res.jpg', 'src/assets/img/maps/Vikendi_Main_High_Res.jpg'],
];

const chunkNames = fs.readdirSync(chunksDir);

for (const [assetName, relativeOutput] of assets) {
  const prefix = `${assetName}.part-`;
  const matchingChunks = chunkNames
    .filter((name) => name.startsWith(prefix))
    .sort();

  if (matchingChunks.length === 0) {
    throw new Error(`No chunks found for ${assetName}`);
  }

  const outputPath = path.join(projectRoot, relativeOutput);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    Buffer.concat(
      matchingChunks.map((name) => fs.readFileSync(path.join(chunksDir, name))),
    ),
  );
}

console.log(`Restored ${assets.length} bundled map assets.`);
