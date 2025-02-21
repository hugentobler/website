import { exec } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonts source directory
const sourceDir = path.join(__dirname, 'static/fonts');

// Fonts R2 bucket name
// https://developers.cloudflare.com/workers/wrangler/commands/#r2-object-put
const bucketName = 'hugentobler';
const cacheControl = 'public, max-age=31536000, immutable';

// Load env variable
dotenv.config();

// Check Cloudflare API token
if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error('CLOUDFLARE_API_TOKEN is not found');
  process.exit(1);
}

// Define allowed font extensions
const allowedExtensions = ['.otf', '.ttf', '.woff2'];

fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error(`Error reading directory ${sourceDir}: ${err}`);
    return;
  }

  files
    .filter((file) => allowedExtensions.includes(path.extname(file).toLowerCase()))
    .forEach((file) => {
      const filePath = path.join(sourceDir, file);
      const command = `npx wrangler r2 object put ${bucketName}/${file} --file=${filePath} --cache-control="${cacheControl}"`;

      exec(command, (error) => {
        if (error) {
          console.error(`Error uploading ${file}:`, error);
          return;
        }
        console.log(`Successfully uploaded ${file}`);
      });
    });
});
