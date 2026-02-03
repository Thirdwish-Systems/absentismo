const fs = require('fs');
const path = require('path');

const testFile = 'c:/Users/Domingo/Desktop/absentismo/absentismo/absentismo/reference/modulo 1.txt';

console.log("--- Reading as UTF-8 ---");
console.log(fs.readFileSync(testFile, 'utf8').substring(0, 500));

console.log("\n--- Reading as Latin1 (binary/ISO-8859-1) ---");
console.log(fs.readFileSync(testFile, 'latin1').substring(0, 500));
