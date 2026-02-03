const fs = require('fs');
const path = require('path');

const srcPath = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/reference/modulo home+framework.txt';
const destPath = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/src/App.tsx';

let content = fs.readFileSync(srcPath, 'utf8');

// Add imports
const imports = `
import Module1 from "./components/Module1/Module1";
import Module2Container from "./components/Module2/Module2Container";
import Module3Container from "./components/Module3/Module3Container";
import Module4 from "./components/Module4/Module4";
`;
content = content.replace('} from "lucide-react";', '} from "lucide-react";' + imports);

// Replace navigation using a simple regex to handle weird characters in labels
const newNav = 'view === "diag" ? <Module1 /> : view === "cost" ? <Module2Container /> : view === "pred" ? <Module3Container /> : <Module4 />';
content = content.replace(/view === "diag" \? <ModuleSlot.*?Workflows" \/>/, newNav);

fs.writeFileSync(destPath, content, 'utf8');
console.log('Done');
