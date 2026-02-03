const fs = require('fs');
const path = require('path');

const copyFile = (src, dest) => {
    try {
        const content = fs.readFileSync(src, 'utf8');
        // Ensure directory exists
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dest, content, 'utf8');
        console.log(`Copied ${src} to ${dest}`);
    } catch (err) {
        console.error(`Error copying ${src}: ${err.message}`);
    }
};

const baseRef = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/reference';
const baseSrc = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/src/components';

// Module 2 files
copyFile(path.join(baseRef, 'modulo 2.2.txt'), path.join(baseSrc, 'Module2/Module2_2.tsx'));
copyFile(path.join(baseRef, 'modulo 2.3.txt'), path.join(baseSrc, 'Module2/Module2_3.tsx'));
copyFile(path.join(baseRef, 'modulo 2.4_temp.tsx'), path.join(baseSrc, 'Module2/Module2_4.tsx'));

// Module 3 files
copyFile(path.join(baseRef, 'modulo 3.2.txt'), path.join(baseSrc, 'Module3/Module3_2.tsx'));
