Math.fact = function(n = 1, limit = 1) {
    if (typeof limit !== 'number' || limit % 1 !== 0 || limit < 1) limit = 1
    if (n < 0 || n % 1 !== 0) return NaN;
    if (n <= limit) return 1;
    return n * this.fact(n-1, limit);
}

Math.nPr = function(n, r) {
    return (this.fact(n, n-r));
}

Math.nCr = function(n, r) {
    return (this.nPr(n, r) / this.fact(r))
}

class Permutation extends Array {
    constructor (r=1, value =[], generator) {
        value = Array.from(value);
        super();
        Array.prototype.push.apply(this, value);
        if (generator && typeof generator !== 'function') throw new Error('"generator" should be a function');
        Object.defineProperties(this, {
            r: {
                get () { return r;},
                set (val) {
                    if (typeof val !== 'number') throw new Error('"r" should be an integer');
                    if (val < 1) val = 1;
                    r = val;
                }
            },
            generator: {
                set (foo) {
                    if (typeof foo !== 'function') throw new Error('"generator" should be a function');
                    generator = function* () {
                        yield* foo(r);
                    } 
                }
            }
        });
        generator || (generator = function* exchange() {
            function takeR (items, r, p = [], stack = [], uniqueItems = new Set()) {
				if (!items.length || r < 1) {
					if (r < 1) {
                        const key = JSON.stringify(p);
                        if (!uniqueItems.has(key)) {
                            stack.push(p);
                            uniqueItems.add(key);
                        }
                    }
					return stack;
				}
				for (let i =0; i < items.length; i++) {
					const copyOfItems = items.slice(0);
					const cp = p.slice(0);
					cp.push(copyOfItems.splice(i,1)[0]);
					takeR(copyOfItems, r-1, cp, stack, uniqueItems);
                }
				return stack;
			}
			yield* takeR(this, r);
        });

        this[Symbol.iterator] = generator;
    }
}

class Combination extends Permutation {
    constructor (r=1, value =[], generator) {
        generator || (generator = function* exchange() {
            function takeR (items, r, p = [], stack = [], uniqueItems = new Set()) {
				if (!items.length || r < 1) {
					if (r < 1) {
                        const key = JSON.stringify(p.slice(0).sort((a, b) => a < b));
                        if (!uniqueItems.has(key)) {
                            stack.push(p);
                            uniqueItems.add(key);
                        }
                    }
					return stack;
				}
				for (let i =0; i < items.length; i++) {
					const copyOfItems = items.slice(0);
					const cp = p.slice(0);
					cp.push(copyOfItems.splice(i,1)[0]);
					takeR(copyOfItems, r-1, cp, stack, uniqueItems);
                }
				return stack;
			}
			yield* takeR(this, this.r);
        });
        super(r, value, generator);
    }
}

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;

class ItemList extends HTMLElement {

    constructor () {
        super();
        this.itemClass = '';

        let value = [];
        let timer = this;
        Object.defineProperty(this, 'value', {
            get () { return value.join(' '); },
            set (val) {
                if (typeof val !== 'string' && typeof val !== 'number')
                    return;
                val = ('' + val).split(' ');
                if (!this.value.match(new RegExp(`^${this.value}`)).length || val.length - value.length != 1) {
                this.innerHTML = this.innerHTML.replace(/<item[\s>][\s\S]*$/,'');
                    this.addItems(val.slice(0));
                } else {
                    this.addItems(val.slice(value.length));
                }
                value = val;
            }
        });
    }

    connectedCallback () {
        const texto = this.innerText;
        this.innerHTML = `
        <style>
            item-list {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
            }

            item {
                font-size: inherit;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        </style>
        `;
        this.itemClass = this.getAttribute('itemClass');
        this.value = texto || this.getAttribute('value');
    }

    addItems (items) {
        items.forEach(item => item && (this.innerHTML += this.createItem(item)));
    }

    createItem (item) {
        return `
            <item class="${this.itemClass}">
                ${item}
            </item>
        `;
    }

    attributeChangeCallback (evt) {
        console.log(evt);
    }
}

customElements.define("item-list", ItemList);

class ListList extends HTMLElement {

    constructor () {
        super();
        this.itemClass = '';

        let value = [];
        Object.defineProperty(this, 'value', {
            get () { return value },
            set (val) {
                if (typeof val !== 'string' && !Array.isArray(val))
                    return;
                if (Array.isArray(val)) {
                    value = val.map(val => val.toUpperCase());
                } else {
                    value = val.toUpperCase().split(',');
                }
                value = value.map(w => `${w.replace(/\s/g, '').length}. ${w}`);
                this.render();
            }
        });
    }

    connectedCallback () {
        this.containerStyle = `
                width: 100%;
                display: flex;
                flex-direction: column;
        `;
        this.itemStyle = `
                justify-content: flex-start;
                align-items: flex-start;
        `;
        this.listClass = this.getAttribute('listClass') || '';
        this.value = this.getAttribute('value') || '';
    }

    render () {
        this.innerHTML = `
        <lits-container class="${this.listClass}" style="${this.containerStyle}">
            ${this.value.map(word => `
            <item-list onclick="search('${word}')" style="${this.itemStyle}" itemClass="btn btn-info btn--small" value="${word}" class="block" type="text"></item-list>
            `).join('')}
        </list-container>
        `;
    }
}

customElements.define("list-list", ListList);

const t = {
    'á': 'a',
    'é': 'e',
    'í': 'i',
    'ó': 'ó',
    'ú': 'u',
    'ü': 'u',
};

function search (word) {
    const specialCharsRegex = new RegExp(Object.keys(t).join('|'));
    word = word.replace(specialCharsRegex,c => t[c]);
    word = encodeURIComponent(word.replace(/\d|\.|\s/g,''));
    window.open(`http://dle.rae.es/?w=${word}`);
}

class CircleTimer extends HTMLElement {
    constructor () {
        super();
        this.containerClass="";
        let value = 0;
        Object.defineProperty(this, 'value', {
            get (){ return value;},
            set (val) {
                if (typeof val !== 'number')
                    return;
                value = Math.abs(val) % 1;
                this.setClip();
            }
        });
    }

    setClip () {
        this.timer || (this.timer = this.querySelector('timer'))
        this.timer.style.clipPath = `polygon${this.getClip()}`;
    }

    getClip () {
        if (this.value <= .125) {
            return `(50% 50%, 50% 0, ${(50 * Math.tan(this.value * 2 * Math.PI)) + 50}% 0)`;
        }
        if (this.value <= .25) {
            return `(50% 50%, 50% 0, 100% 0, 100% ${(50 - 50 * Math.tan((.25 - this.value) * 2 * Math.PI))}%)`;
        }
        if (this.value <= .375) {
            return `(50% 50%, 50% 0, 100% 0, 100% ${(50 + 50 * Math.tan((this.value - .25) * 2 * Math.PI))}%)`;
        }
        if (this.value <= .5) {
            return `(50% 50%, 50% 0, 100% 0, 100% 100% , ${(50 * Math.tan((.5 - this.value) * 2 * Math.PI)) + 50}% 100%)`;
        }
        if (this.value <= .625) {
            return `(50% 50%, 50% 0, 100% 0, 100% 100% , ${(50 - 50 * Math.tan((this.value - .5) * 2 * Math.PI))}% 100%)`;
        }
        if (this.value <= .75) {
            return `(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 ${(50 + 50 * Math.tan((.75 - this.value) * 2 * Math.PI))}%)`;
        }
        if (this.value <= .875) {
            return `(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 ${(50 - 50 * Math.tan((this.value - .75) * 2 * Math.PI))}%)`;
        }
        return `(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, ${(50 - 50 * Math.tan((1 - this.value) * 2 * Math.PI))}% 0)`;
    }

    render () {
        this.innerHTML = `
            <style>
                circle-timer container {
                    width: 100%;
                    border-radius: 50%;
                    overflow: hidden;
                    display: block;
                    background-color: gray;
                }
                circle-timer timer {
                    display: block;
                    width: 100%;
                    padding-top: 100%;
                    clip-path: polygon${this.getClip()};
                    background-color: black;
                }
            </style>
            <container class="${this.containerClass}">
                <timer></timer>
            </container>
        `
    }

    connectedCallback () {
        this.containerClass = this.getAttribute('containerClass');
        this.render();
    }
}

customElements.define("circle-timer", CircleTimer);

class LinearTimer extends HTMLElement {
    constructor () {
        super();
        this.containerClass = '';
        let value = 0;
        let time = 0;
        Object.defineProperty(this, 'value', {
            get (){ return value;},
            set (val) {
                if (typeof val !== 'number')
                    return;
                value = Math.abs(val) % 1;
                this.setWidth();
            }
        });
        Object.defineProperty(this, 'time', {
            get (){ return time;},
            set (val) {
                time = val;
                this.setTime();
            }
        });
    }

    setWidth () {
        this.timer || (this.timer = this.querySelector('timer'))
        this.timer.style.width = `${this.value*100}%`;
    }

    setTime () {
        this.timerText || (this.timerText = this.querySelector('timer-text'))
        if(!this.timerText) return;
        this.timerText.innerText = this.time;
    }

    render () {
        this.innerHTML = `
            <style>
                linear-timer container {
                    width: 100%;
                    overflow: hidden;
                    display: block;
                    background-color: gray;
                    height: 100%;
                    display: flex;
                    position: relative;
                    font-size: inherit;
                }
                linear-timer timer {
                    display: block;
                    width: ${this.value * 100}%;
                    background-color: black;
                    height: 100%;
                    font-size: inherit;
                }
                linear-timer timer-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: black;
                    font-size: inherit;
                }
            </style>
            <container class="${this.containerClass}">
                <timer>
                    <timer-text> ${this.time} </timer-text>
                </timer>
            </container>
        `
    }

    connectedCallback () {
        this.containerClass = this.getAttribute('containerClass');
        this.time = this.getAttribute('time') || 0;
        this.render();
    }
}

customElements.define("linear-timer", LinearTimer);

class RangeSelector extends HTMLElement {
    constructor () {
        let min=0, max=1, value=50;
        Object.defineProperties(this, {
            min: {
                get () {},
                set (value) {
                    if (typeof value !== 'number') throw new Error('"min" property has be a number');;
                    if (value !== 100) value = value % 100;
                    if (value < 0 ) value = 100 - value;
                    min = value;
                }
            },
            max: {
                get () {},
                set (value) {
                    if (typeof value !== 'number') throw new Error('"max" property has be a number');
                    if (value === min) value = min + 1;
                    min = value;
                }
            },
            value: {
                get () { return (max - min) * (value / 100)},
                set (value) {
                    if (typeof value === 'string') {
                        // if (value.match)
                    }
                }
            }
        });
    }
}

class VoicesSelector extends HTMLElement {

    selectVoice (voice) {
        const voicesSelector = this;
        return function() {
            var voiceEvent = new CustomEvent('voiceSelected', { 
                'detail': {voice} ,
                bubbles: true,
                cancelable: false
            });
            voicesSelector.dispatchEvent(voiceEvent);
        }
    }

    init () {
        new Promise(resolve => {
            const step = () => {
                this.voices = window.speechSynthesis.getVoices()
                // .filter(v=>!!v.name.match(/spanish|englis|español/i))
                .sort((v1, v2) => {
                    const v1C = !!v1.name.match(/spanish|español/i);
                    const v2C = !!v2.name.match(/spanish|español/i);
                    if (v1C == v2C) return 0;
                    if (v1C) return -1;
                    return 1;
                });
                if(this.voices.length) return resolve();
                setTimeout(step,200);
            }
            step();
        }).then(() => {
            // this.innerHTML += `
            // <style>
            //     voices-selector, voices-selector *:not(style) {
            //         display: flex;
            //         font-size: 24px;
            //         width: 300px;
            //     }

            //     voices-selector voices-container {
            //         width: 100%;
            //         flex-direction: column;
            //     }

            //     voices-selector voice {
            //         margin: 10px;
            //     }
            // </style>
            // <voices-container>
            //     ${this.voices.map((voice,i) => `
            //         <voice class="${this.voiceClass}"> 
            //             ${voice.name}
            //         </voice>
            //     `).join('')}
            //     <expand-button>
            //         <button class="${this.expandClass}"></button>
            //     </expand-button>
            // </voices-container>
            // `;
            Array.from(this.querySelectorAll('voice')).forEach((voiceElm,i) =>{
                voiceElm.addEventListener('click', this.selectVoice(this.voices[i]));
            });
        });
        
        
    }

    connectedCallback () {
        this.init();
        this.voiceClass = this.getAttribute('voiceClass');
    }
}

customElements.define("voices-selector", VoicesSelector);

const tipos = {
  vocales: [
    ['A',1],
    ['E',1],
    ['I',1],
    ['O',1],
    ['U',1],
  ],
  consonantes: [ 
      ['B', 1],
      ['C', 1],
      ['D', 1],
      ['F', 1],
      ['G', 1],
      ['H', .7],
      ['J', 1],
      ['K', .1],
      ['L', 1],
      ['M', 1],
      ['N', 1],
      ['Ñ', .15],
      ['P', 1],
      ['Q', .1],
      ['R', 1],
      ['S', 1],
      ['T', 1],
      ['V', .8],
      ['W', .05],
      ['X', .2],
      ['Y', .15],
      ['Z', .15],
  ],
  numeros: [
      [1,1],
      [2,1],
      [3,1],
      [4,1],
      [5,1],
      [6,1],
      [7,1],
      [8,1],
      [9,1],
      [15,1],
      [25,1],
  ]
};

const playTime = 47;

let bn, bc, bv, br, vs, cLetras, cNumeros, letterSet = [], goal, voice;

function toggleButtons (buttons = Array.from(document.querySelectorAll('button'))) {
    buttons.forEach(n => {
        n.disabled = !n.disabled;
    })
}

const getItems = (items, n, f) => {
    return randItems(items.slice(0).map(i => i.slice(0)), n, f);
}

const randItems = (items, n = 0, f = () => true) => {
    if (n < 1)
        return [];
    const c = Math.floor(Math.random() * items.length);
    const [item, p] = items[c];
    if ((p === 1 || Math.random() < p) && f(item)) {
        items[c][1] *= .68; 
        return [item, ...randItems(items, n - 1, f)];
    }
    return randItems(items, n, f);
}

const noMore = item => letterSet.filter(l => l=== item).length < 5;

function playVowel () {
    showResults(false);
    playWords(tipos.vocales);
}

// http://dle.rae.es/?w=${palabra}

function playConsonant () {
    showResults(false);
    playWords(tipos.consonantes);
}

function playWords (items) {
    if (letterSet.length >= 9) return false;
    const isFirstLetter = letterSet.length === 0;
    if (isFirstLetter) {
        cNumeros.value = '';
        toggleButtons();
    } else {
        toggleButtons([bv,bc]);
    }
    item = getItems(items, 1, noMore);
    letterSet.push(item);
    
    writeItems([item], cLetras, null, isFirstLetter).then(() => {
        if (letterSet.length === 9) {
            prepareWordsSolution(letterSet.join(''));
            playGame().then(clearGame)
        }else {
            toggleButtons([bv,bc]);
        }
    });
}

function prepareWordsSolution (word) {
    word = encodeURIComponent(word.toLowerCase());
    fetch(`/words/${word}`)
    .then(response => response.json())
    .then(response => addSolutions(response.reduce((arr, cv) => [...arr, ...cv], [])
    .map(w => w.split('').join(' ').toUpperCase())));
}

class Operation extends Number {
    constructor (value) {
        let r = 0;
        let history = '';

        const setValue = v => {
            if (typeof v === 'undefined') return;
            if (typeof v !== 'number') throw new Error('Need a number');
            r = v;
            history = `${r}`;
        }

        const exec = opr => {
            if (typeof opr !== 'string') throw new Error('Need a string');
            if(!/^[\d\s\(\)\/x*+-]+$/i.test(opr)) throw new Error('Not a valid operation');
            opr = opr.replace(/x/ig, '*');
            return new Function(`return ${opr};`)();
        }

        if (!/string|number/.test(typeof value)) {
            if (value instanceof Operation) {
                setValue(+value);
                history = value.toString();
                super(+value);
            } else {
               super(); 
            }
        } else {
            if (typeof value === 'string') value = exec(value);
            if (value) setValue(value);
            super(value);
        }

        this.valueOf = () => r;
        this.toString = () => history;

        Object.defineProperties(this, {
            value: {
                get () {return r},
                set (v) {
                    setValue(v)
                }
            },
            history: {
                get () {return history}
            }
        });

        this.sum = val => { 
            const tempH = history;
            this.value += +val;
            let sum = val.toString();
            if (/\D/.test(sum)) sum = `(${sum})`
            history = `${tempH?`${tempH} + `:``}${sum}`;
            return this;
        }

        this.mul = val => {
            const tempH = history; 
            this.value *= +val;
            let sum = val.toString();
            if (/\D/.test(sum)) sum = `(${sum})`
            if (r) {
                history = `${/[+-]/.test(tempH)? `(${tempH})`:`${tempH}`} x ${sum}`
            } else {
                history = `${r} x ${sum}`;
            }
            return this;
        }

        this.dif = val => {
            const tempH = history; 
            this.value -= +val;
            let sum = val.toString();
            if (/\D/.test(sum)) sum = `(${sum})`
            history = `${tempH?`${tempH} `:``}-${sum}`;
            return this;
        }

        this.div = val => {
            const tempH = history; 
            this.value /= +val;
            let sum = val.toString();
            if (/\D/.test(sum)) sum = `(${sum})`
            if (r) {
                history = `${/[+-]/.test(tempH)? `(${tempH})`:`${tempH}`} / ${sum}`
            } else {
                history = `${r} / ${sum}`;
            }
            return this;
        }

        this.exec = exec;
    }
}

function getAllOperations(a,b) {
    a = new Operation(a);
    let M = a, m = a;
    if ( a > b) m = b;
    else M = b;
    return [
        new Operation(M).sum(m),
        new Operation(a).dif(b),
        new Operation(M).mul(m),
        new Operation(a).div(b)
    ];
}

class Numerable {
    constructor (n) {
        this.set = (v) => {
            if (typeof v !== 'number') throw new Error('Need a number');
            n = Math.floor(v);
            return this;
        }
        if (typeof n !== 'undefined') {
            this.set(n);
        } else {
            this.set(0);
        }
        this[Symbol.iterator] = function* (){
            const step = -1 * (Math.abs(n) / n);
            for (let i = n; i !== 0; i += step) {
                yield i;
            }
        };
    }
}

class Keyable {
    constructor (items, descriptor) {
        if (typeof descriptor !== 'function') throw new Error('Need a function as descriptor');
        let length = (typeof items.length === 'number' && items.length) || items;
        if (typeof items === 'number') items = Array.from(new Numerable(items)).reverse();
        if (typeof length !== 'number') throw new Error('Items should be iterable');
        items.forEach((key, i) => {
            let value = descriptor(key, i);
            try {
                Object.defineProperty(this, `${key}`, {
                    get () {return value}
                });
            }catch(ex) {
                throw new Error('Items can not content duplicated keys');
            }
        });
        Object.defineProperty(this, 'length', {get () {return length}})
        this[Symbol.iterator] = function* () {
            for (let a=0; a < length; a++) {
                yield this[items[a]];
            }
        }
    }
}

class OperationsPermutation {
    constructor(numbers, stop) {
        numbers = Array.from(numbers);
        if (typeof foo !== 'function') {
            stop = () => false;
        }
        Object.defineProperties(this, {
            numbers: {
                get () {return value;}
            },
            stop: {
                set (foo) {
                    if (typeof foo !== 'function') throw new Error('Need a function');
                    stop = foo;
                }
            }
        });
        
        const permutations = Array.from(new Permutation(6, numbers));
        const operations = new Map();

        const allCombinations = [];
        for (let a=2;a<=numbers.length;a++) {
            allCombinations.push(...this.getOperationGroups(a));
        }
        allCombinations.sort((a, b) => a.reduce((p, c) => p + c, 0) - b.reduce((p, c) => p + c, 0));

        console.log('hola')

    }

    getAllNumbers (l,n) {
        const [numbers, uniques ]= [[], new Set()];
        for (let s = l; s <= n; s += l) {
            const c = [
                ...Array.from(new Numerable(s/l)).map(() => l),
                ...Array.from(new Numerable(n-s)).map(() => 1)
            ];
            Array.from(new Permutation(c.length, c)).map(c => c.join(',').replace(/1,1/g, '2').split(',').map(e => +e)).forEach(c => {
                const k = c.join(',');
                if (!uniques.has(k)) {
                    uniques.add(k);
                    numbers.push(c);
                }
            });
        }
        return numbers;
    }
    
    getOperationGroups (n) {
        let allCombinations = [];
        for (let m = 2; m < n; m++) {
            allCombinations.push(...this.getAllNumbers(m,n));
        }
        return allCombinations;
    }
}

function prepareNumbersSolution (numbers, goal) {
    console.log(numbers,goal);
    let posibilities = new Combination(2,numbers);
    let solutions = [];

    const add = solution => {
        if (solutions.find(s => s.toString() === solution.toString())) return;
        if (+solution % 1 !== 0) return;
        solutions.push(solution);
        solutions.sort((a, b) => Math.abs(+a - goal) - Math.abs(+b - goal));
        solutions = solutions.splice(0, 10);
    }

    Array.from(posibilities).every(p => {
        const mult = new Operation(p.join(' x '));
        add(mult);
        return solutions.length < 10 || solutions[9] !== goal;
    });
    
    posibilities = new Combination(3,numbers);
    Array.from(posibilities).every(p => {
        let grp = new Permutation(2, p);
        Array.from(grp).every(g => {
            const g2 = p.reduce((o, c) =>{
                const isI = o.q.findIndex(q => q === c);
                if ( isI > -1) o.q.splice(isI, 1);
                else o.d = c;
                return o;
            },{q:g.slice(0),d:null}).d;
            getAllOperations(...g).every(opr => {
                getAllOperations(opr, g2).every(cbn => {
                    add(cbn);
                    return solutions.length < 10 || solutions[9] !== goal;
                });
                return solutions.length < 10 || solutions[9] !== goal;
            });
            return solutions.length < 10 || solutions[9] !== goal;
        });
        return solutions.length < 10 || solutions[9] !== goal;
    });
    addSolutions(solutions.map(s=>`${s.toString()} = ${+s}`));
}

function showResultsButton (show = true) {
    const body = document.querySelector('body');
    if (show) {
        body.classList.add('results-ready');
    } else {
        body.classList.remove('results-ready');
    }
}

function showResults (show = true) {
    const body = document.querySelector('body');
    if (show) {
        showResultsButton(false);
        body.classList.add('results-visible');
    } else {
        body.classList.remove('results-visible');
    }
}

function addSolutions (solutions) {
    const ll = document.querySelector('list-list');
    ll.value = solutions;
}

function playNumbers () {
    showResults(false);
    toggleButtons();
    const nn = letterSet = getItems(tipos.numeros, 6);
    goal = `${getItems(tipos.numeros.slice(0,9), 1).join('')}${getItems([[0,1], ...tipos.numeros.slice(0,9)], 2).join('')}`

    cNumeros.value = '';
    writeItems(letterSet, cLetras).then(()=>{
        return speak('llegar a');
    }).then(()=>{
        prepareNumbersSolution(nn, goal);
        return writeItems(['',goal], cNumeros)
    }).then(playGame).then(clearGame);
}

const writeItems = (items = [], elm, t = 1, clearData = true) => {
    if (!elm) return;
    if (clearData) {
        elm.value = '';
    }
    if (!items.length) return Promise.resolve(true);
    return new Promise(resolve => {
        let r = Promise.resolve(true);
        elm.value += (clearData?'': ' ') + items[0];
        if (items[0]) r = speak(items[0]);
        if (clearData) return resolve(r);
        setTimeout(() => resolve(r), t * 1000);
    }).then(() => {
        return writeItems(items.slice(1), elm, t, false)
    });
}

const playGame = () => {
    let circleTimer = document.querySelector('circle-timer');
    let linearTimer = document.querySelector('linear-timer');
    document.querySelector('body').classList.add('playing');
    return speak('¡corre tiempo!')
    .then(counter(playTime, (t,T) => {
        circleTimer.value = (T-t)/T;
        linearTimer.value = (T-t)/T;
    },(t, T) => {
        (t <= 11 && t >= 2 && speak(t-1,.5)) || t === 0 && playEnd();
        linearTimer.time = T-t;
    }).then(() => {
        speak(`${playTime} segundos`).then(()=>{
            document.querySelector('body').classList.remove('playing');
            toggleButtons();
            showResultsButton(true);
            return true;
        });
    }));
};

const playEnd = () => {
    const audio = new Audio();
    audio.src = "/sounds/end.mp3";
    audio.play();
}

const clearGame = () => {
    letterSet = [];
    goal = null;
    return true;
};

const counter = (totalTime,timeCallback = () => {}, stepCallback = () => {}) => {
    totalTime = Math.round(totalTime);
    const uniqueSeg = new Set();
    uniqueSeg.add(totalTime);
    return new Promise(resolve => {
        var start = Date.now();
        function step(timestamp) {
            const progress = totalTime - ((Date.now() - start) / 1000);
            if (progress <= 0) {
                stepCallback(0 ,totalTime);
                return resolve(true);
            }
            timeCallback(progress, totalTime);
            const currentSeg = Math.ceil(progress);
            if (!uniqueSeg.has(currentSeg)) {
                uniqueSeg.add(currentSeg);
                stepCallback(currentSeg, totalTime);
            }
            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    });
}

const speak = (text, waitingTime=0, currentVoice) => {
    currentVoice || (currentVoice = voice);
    return new Promise(resolve => {
        var msg = new SpeechSynthesisUtterance();
        if (currentVoice)
            msg.voice = voice;
        msg.voiceURI = 'native';
        msg.rate =1.5;
        msg.pitch = 1;
        msg.text = text;
        msg.lang = 'es-ES'

        msg.onend = msg.onerror = msg.onpause = function(e) {
            resolve(true);
        };

        setTimeout(() => {
            speechSynthesis.speak(msg);
        }, waitingTime * 1000);

        setTimeout(()=>resolve(true),3000)
    });
}

window.addEventListener('load', () => {
    bv = document.querySelector('#bv');
    bc = document.querySelector('#bc');
    bn = document.querySelector('#bn');
    br = document.querySelector('#br');
    vs = document.querySelector('voices-selector');
    cLetras = document.querySelector('#letras');
    cNumeros = document.querySelector('#numeros');

    bc.addEventListener('click', playConsonant);
    bv.addEventListener('click', playVowel);
    bn.addEventListener('click', playNumbers);
    br.addEventListener('click', showResults);

    vs.addEventListener('voiceSelected',evt => {
        voice = evt.detail.voice;
        speak(`${playTime} segundos`);
    });

    window.addEventListener('keyup', evt => {
        switch(evt.code) {
            case "KeyC":
                if (!bc.disabled) bc.click();
            break;
            case "KeyV":
                if (!bv.disabled) bv.click();
            break;
            case "KeyN":
                if (!bn.disabled) bn.click();
            case "KeyR":
                if (!br.disabled) br.click();
            break;
        };
    });
});