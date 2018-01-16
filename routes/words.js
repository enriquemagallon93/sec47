var express = require('express');
var router = express.Router();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const dbFile = 'db/espaniol.json';

const adapter = new FileSync(dbFile);
const db = low(adapter);

/* GET users listing. */
router.get('/:key', function(req, res, next) {
    const key = decodeURIComponent(req.params.key);
    const keyMap = new Map();
    Array.from(key).forEach(c => {
        keyMap.set(c, (keyMap.get(c) || 0) + 1);
    });
    let filter = new RegExp(`^${Array.from(keyMap)
        .sort((a, b) => (a[0] > b[0] && 1) || -1)
        .map(m => `(?:${m[0]}[1-${m[1]}])?`).join('')}$`,'i');
    
    const words = db.get('keys').value()[0]
    .filter(v => filter.test(v.key))
    .map((v) => v.words.map(w => w.word))
    .filter(w => w[0].length > 1)
    .sort((a, b) =>
     -a[0].length + b[0].length)
    .reduce((f, va) => {
        if (!f.length || (f[f.length -1][0].length !== va[0].length)) {
            f.push(va);
        } else {
            f[f.length-1] = [...f[f.length-1], ...va];
        }
        return f;
    }, []);

    res.json(
        words.map(v => {
            console.dir(v);
            return v.sort((a, b) => a > b? 1: -1);
        })
    );
});

module.exports = router;
