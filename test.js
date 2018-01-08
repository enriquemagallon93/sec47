const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const dbFile = 'db/espaniol.json';

const adapter = new FileSync(dbFile);
const db = low(adapter);

console.log(db.get('keys').value()[0].filter(v=>/^(?:b[1-2])?(?:c[1-2])?(?:d[1-2])?(?:e[1-2])?(?:e[1-1])?$/.test(v.key)).map(v=>v.words.map(w=>w.word).join(', ')));