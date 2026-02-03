const fs = require('fs');
const path = require('path');

const baseRef = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/reference';
const baseSrc = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/src';
const componentsDir = path.join(baseSrc, 'components');

// Helper to ensure dir exists
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// Copy with explicit encoding
const copyUtf8 = (srcFile, destFile) => {
    try {
        // Read as latin1 (binary/ISO-8859-1) to preserve byte values 1:1
        const content = fs.readFileSync(srcFile, 'latin1');
        ensureDir(path.dirname(destFile));
        fs.writeFileSync(destFile, content, 'utf8');
        console.log(`Restored: ${path.basename(destFile)}`);
        return content;
    } catch (e) {
        console.error(`Failed to restore ${path.basename(destFile)}:`, e.message);
        return null; // Signal failure
    }
};

// 1. Restore Components
const componentMap = [
    { ref: 'modulo 1.txt', dest: 'Module1/Module1.tsx' },
    { ref: 'modulo 2.1.txt', dest: 'Module2/Module2_1.tsx' },
    { ref: 'modulo 2.2.txt', dest: 'Module2/Module2_2.tsx' },
    { ref: 'modulo 2.3.txt', dest: 'Module2/Module2_3.tsx' },
    { ref: 'modulo 2.4_temp.tsx', dest: 'Module2/Module2_4.tsx' },
    { ref: 'modulo 3.1.txt', dest: 'Module3/Module3_1.tsx' },
    { ref: 'modulo 3.2.txt', dest: 'Module3/Module3_2.tsx' },
    { ref: 'modulo 4.txt', dest: 'Module4/Module4.tsx' },
];

componentMap.forEach(m => {
    copyUtf8(path.join(baseRef, m.ref), path.join(componentsDir, m.dest));
});

// 2. Restore App.tsx and Re-Integrate
const appRefPath = path.join(baseRef, 'modulo home+framework.txt');
const appDestPath = path.join(baseSrc, 'App.tsx');

// Read as latin1 to capture special chars correctly from legacy file
let appContent = fs.readFileSync(appRefPath, 'latin1');

// Re-apply imports
const imports = `
import Module1 from "./components/Module1/Module1";
import Module2Container from "./components/Module2/Module2Container";
import Module3Container from "./components/Module3/Module3Container";
import Module4 from "./components/Module4/Module4";
`;
// Only add imports if not already there (fresh copy won't have them)
if (!appContent.includes('import Module1')) {
    appContent = appContent.replace('} from "lucide-react";', '} from "lucide-react";' + imports);
}

// Re-apply navigation logic
const navRegex = /view === "diag" \? <ModuleSlot.*?Workflows" \/>/;
const newNav = 'view === "diag" ? <Module1 /> : view === "cost" ? <Module2Container /> : view === "pred" ? <Module3Container /> : <Module4 />';

if (navRegex.test(appContent)) {
    appContent = appContent.replace(navRegex, newNav);
}

fs.writeFileSync(appDestPath, appContent, 'utf8');
console.log('Restored and patched: App.tsx');

console.log('All files restored with UTF-8 encoding.');
