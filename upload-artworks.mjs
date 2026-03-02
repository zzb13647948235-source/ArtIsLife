// 运行方式: FIREBASE_PRIVATE_KEY="..." node upload-artworks.mjs
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: 'artislife-7384f',
      clientEmail: 'firebase-adminsdk-fbsvc@artislife-7384f.iam.gserviceaccount.com',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: 'artislife-7384f.firebasestorage.app',
  });
}

const bucket = getStorage().bucket();
const urlMap = {};

async function uploadDir(localDir, remoteDir) {
  const files = readdirSync(localDir);
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const remotePath = `${remoteDir}/${file}`;
    const localKey = `/${remoteDir}/${file}`;
    try {
      await bucket.upload(localPath, {
        destination: remotePath,
        metadata: { cacheControl: 'public, max-age=31536000' },
      });
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/artislife-7384f.firebasestorage.app/o/${encodeURIComponent(remotePath)}?alt=media`;
      urlMap[localKey] = publicUrl;
      console.log(`✓ ${file}`);
    } catch (e) {
      console.error(`✗ ${file}: ${e.message}`);
    }
  }
}

console.log('上传 paintings...');
await uploadDir(path.join(__dirname, 'public/artworks/paintings'), 'artworks/paintings');

console.log('上传 AI...');
await uploadDir(path.join(__dirname, 'public/artworks/AI'), 'artworks/AI');

// 上传根目录的几个文件
const rootFiles = ['《构图八号》.webp', '《石工》.png'];
for (const file of rootFiles) {
  const localPath = path.join(__dirname, 'public/artworks', file);
  const remotePath = `artworks/${file}`;
  try {
    await bucket.upload(localPath, {
      destination: remotePath,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/artislife-7384f.firebasestorage.app/o/${encodeURIComponent(remotePath)}?alt=media`;
    urlMap[`/artworks/${file}`] = publicUrl;
    console.log(`✓ ${file}`);
  } catch (e) {
    console.error(`✗ ${file}: ${e.message}`);
  }
}

writeFileSync(path.join(__dirname, 'artwork-urls.json'), JSON.stringify(urlMap, null, 2));
console.log(`\n完成！共 ${Object.keys(urlMap).length} 个文件，URL 已保存到 artwork-urls.json`);
