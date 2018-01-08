let fs = require('fs');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const dbFile = 'db/espaniol.json';

const adapter = new FileSync(dbFile);
const db = low(adapter);

const input = fs.createReadStream('./lemario/espaniol.txt',{
    encoding: 'utf16le'
});

const rl = require('readline').createInterface({
    input,
    terminal: false
});

const t = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'ó',
    'ú': 'u',
    'ü': 'u',
};
const specialCharsRegex = new RegExp(Object.keys(t).join('|'));

function getWord(word) {
    const wordObject = {
        word: word.toLowerCase(),
        size: word.length
    };
    const keys = new Map();

    wordObject.cleanWord = wordObject.word.replace(specialCharsRegex,c => t[c]);
    Array.from(wordObject.cleanWord).forEach(c=>keys.set(c,(keys.get(c) || 0) + 1));
    wordObject.key = Array.from(keys).sort((a, b) => (a[0] > b[0] && 1) || -1).map(e => e.join('')).join('')

    return wordObject;
}

const totalToRead = 1565355;
let c = 0;
const allKeys = {};
rl.on('line', word => {
    word = word.trim();
    if (word && word.length <= 9){
        word = getWord(word);
        if (/^\w+$/.test(word.cleanWord)) {
            allKeys[word.key] = allKeys[word.key] || {
                key: word.key,
                words: []
            };
            allKeys[word.key].words.push(word);
        }
    }
    c = c + 1;
    if (c % 156 === 0) {
        console.log(`${(c * 100 / totalToRead).toFixed(2)}%`);
    }
});

input.on('end',()=> {
    db.defaults({keys:[Object.keys(allKeys).map(key => allKeys[key])]}).write();
});