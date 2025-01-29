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
const bucketName = 'fonts-hvgentobler';

// Load env variable
dotenv.config();

// Check Cloudflare API token
if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error('CLOUDFLARE_API_TOKEN is not found');
  process.exit(1);
}

fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error(`Error reading directory ${sourceDir}: ${err}`);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(sourceDir, file);
    const command = `npx wrangler r2 object put ${bucketName}/${file} --file=${filePath}`;

    exec(command, (error) => {
      if (error) {
        console.error(`Error uploading ${file}:`, error);
        return;
      }
      console.log(`Successfully uploaded ${file}`);
    });
  });
});
