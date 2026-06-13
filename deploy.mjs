import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environmental variables from .env file
dotenv.config();

const {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
  APPWRITE_API_KEY,
  GITHUB_REPO
} = process.env;

async function runPipeline() {
  try {
    // 1. Get the current app version from package.json
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const version = pkg.version;
    const tagName = `v${version}`;
    const apkFilename = `DelhiMetro-${tagName}.apk`;
    const localApkPath = path.join(process.cwd(), apkFilename);

    console.log(`\n🚀 Starting OTA Deployment Pipeline for Version: ${version}...`);

    // 2. Trigger Expo EAS Build
    console.log('\n📦 Triggering EAS Build on the cloud (This may take a few minutes)...');
    const easOutput = execSync('eas build -p android --profile preview --non-interactive', { encoding: 'utf8' });
    
    // Extract the APK URL from Expo's terminal output
    const urlMatch = easOutput.match(/https:\/\/expo\.dev\/artifacts\/[^ \n]+/);
    if (!urlMatch) throw new Error('Could not parse the build artifact URL from EAS output.');
    const expoDownloadUrl = urlMatch[0];
    
    console.log(`✅ Build complete! Expo Artifact URL: ${expoDownloadUrl}`);

    // 3. Download the APK to your computer temporarily
    console.log('\n⏳ Downloading the APK file from Expo servers...');
    const fileResponse = await fetch(expoDownloadUrl);
    if (!fileResponse.ok) throw new Error('Failed to download artifact from Expo.');
    
    const fileStream = fs.createWriteStream(localApkPath);
    await new Promise((resolve, reject) => {
      fileResponse.body.pipe(fileStream);
      fileResponse.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    console.log(`✅ File downloaded locally as: ${apkFilename}`);

    // 4. Push to GitHub Releases
    console.log(`\n🐙 Creating GitHub Release [${tagName}] and uploading APK...`);
    execSync(`gh release create ${tagName} "${localApkPath}" --repo ${GITHUB_REPO} --title "Release ${tagName}" --notes "Automated OTA update deployment for version ${version}."`);
    
    const publicGithubUrl = `https://github.com/${GITHUB_REPO}/releases/download/${tagName}/${apkFilename}`;
    console.log(`✅ GitHub Release live at: ${publicGithubUrl}`);

    // 5. Update the Appwrite Database
    console.log('\n📡 Syncing new version config to Appwrite Database...');
    const appwriteResponse = await fetch(`${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections/${APPWRITE_COLLECTION_ID}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': APPWRITE_API_KEY
      },
      body: JSON.stringify({
        documentId: 'unique()',
        data: {
          version_number: version,
          is_mandatory: true,
          apk_url: publicGithubUrl
        }
      })
    });

    if (!appwriteResponse.ok) {
      const dbResult = await appwriteResponse.json();
      throw new Error(`Appwrite API Error: ${JSON.stringify(dbResult)}`);
    }

    console.log('✅ Appwrite database successfully updated!');
    
    // 6. Clean up local APK file
    fs.unlinkSync(localApkPath);
    console.log('\n🎉 ALL DONE! The update is deployed successfully.');

  } catch (error) {
    console.error('\n❌ Pipeline Failed:', error.message);
    process.exit(1);
  }
}

runPipeline();