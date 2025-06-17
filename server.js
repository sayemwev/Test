const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public')); // To serve downloaded APKs

// Ensure required directories exist
fs.ensureDirSync('uploads');
fs.ensureDirSync('public/apks');
fs.ensureDirSync('temp_projects');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post('/generate-apk', upload.single('appIcon'), (req, res) => {
    const { appName, fullCode } = req.body;
    const iconFile = req.file;

    if (!appName || !fullCode || !iconFile) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // --- Basic validation and sanitation ---
    const sanitizedAppName = appName.replace(/[^a-zA-Z0-9]/g, '');
    const packageName = `com.generated.${sanitizedAppName.toLowerCase()}`;
    const projectDir = path.join(__dirname, 'temp_projects', `project_${Date.now()}`);
    const apkName = `${sanitizedAppName}.apk`;
    const finalApkPath = path.join(__dirname, 'public', 'apks', apkName);

    console.log(`[1/5] Creating project structure for: ${appName}`);

    try {
        // --- This is a SIMPLIFIED simulation. A real server would use Cordova/Capacitor or Android Studio CLI ---
        // For this example, we will simulate the process.
        // A real implementation requires a full Android development environment on the server.

        // 1. Create a basic project structure (simulated)
        fs.ensureDirSync(path.join(projectDir, 'app', 'src', 'main', 'assets'));
        fs.ensureDirSync(path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-hdpi'));
        
        // 2. Write the user's HTML code to an index.html file
        fs.writeFileSync(path.join(projectDir, 'app', 'src', 'main', 'assets', 'index.html'), fullCode);
        console.log(`[2/5] Wrote user code to index.html`);
        
        // 3. Move uploaded icon to the project
        fs.moveSync(iconFile.path, path.join(projectDir, 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher.png'));
        console.log(`[3/5] App icon placed.`);

        // 4. Create a basic AndroidManifest.xml and a WebView activity (simulated)
        // This part is highly complex in reality. We are just creating dummy files here.
        // A real server would call `cordova create`, `npx cap init`, or use Gradle.
        console.log(`[4/5] Simulating Android project setup (AndroidManifest, Gradle files etc.)...`);
        
        // --- SIMULATE THE BUILD PROCESS ---
        console.log(`[5/5] Simulating APK build process... This would take several minutes in reality.`);
        
        // In a real scenario, you'd run a shell command like:
        // shell.exec(`cd ${projectDir} && ./gradlew assembleDebug`);
        
        // For this simulation, we'll just create a dummy file to represent the APK
        fs.writeFileSync(finalApkPath, `This is a simulated APK for the app: ${appName}`);
        
        console.log(`Build successful! APK available at: ${apkName}`);

        // Clean up the temporary project directory
        fs.removeSync(projectDir);

        res.json({
            success: true,
            message: 'APK generated successfully!',
            downloadUrl: `/apks/${apkName}`
        });

    } catch (error) {
        console.error("APK Generation Error:", error);
        // Clean up on error
        if (fs.existsSync(projectDir)) fs.removeSync(projectDir);
        res.status(500).json({ success: false, message: 'An error occurred during APK generation.' });
    }
});

app.listen(port, () => {
    console.log(`Web to APK server listening at http://localhost:${port}`);
});