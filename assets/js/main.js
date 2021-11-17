const group = document.getElementById("boids");
const chunksize = 20;
// const chunksize = 20;

function rand (min, max) {
	return Math.floor((Math.random() * (max - min) + min)*10)/10;
}

function randint (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

class Vector {
    constructor (x, y) {
        x = (x===undefined?0:x);
        y = (y===undefined?x:y);
        this.x = x;
        this.y = y;
    }
    add (vec) {
        return new Vector(this.x+vec.x, this.y+vec.y);
    }
    sub (vec) {
        return new Vector(this.x-vec.x, this.y-vec.y);
    }
    mul (scal) {
        return new Vector(this.x*scal, this.y*scal);
    }
    div (scal) {
        return new Vector(this.x/scal, this.y/scal);
    }
    mag () {
        return Math.sqrt(Math.pow(this.x, 2)+Math.pow(this.y, 2));
    }
    norm () {
        return this.div(this.mag());
    }
    limit (n) {
        if (this.mag() <= n) {
            return;
        }
        v = this.norm().mul(n);
        this.x = v.x;
        this.y = v.y;
    }
    rot (n) {
        n = (Math.PI / 180) * n
        return new Vector(this.x * Math.cos(n) - this.y * Math.sin(n), this.x * Math.sin(n) + this.y * Math.cos(n));
    }
}

class Boid {
    constructor (x, y, rot, color) {
        this._pos = new Vector(x, y);
        this._rot = rot;
        this._color = color;
        this.chunk = "-1,-1";
        this._following = null;
        this.top = null;
        this.outlet = document.createElement("div");
        this.outlet.appendChild(document.createElement("div"));
        this.outlet.style.cssText = "--x:"+x+";--y:"+y+";--rot:"+rot+";--color:"+color+";--bord:black;";
        this.outlet.className = "boid";
        group.appendChild(this.outlet);
        this.updatechunks();
    }
    getchunk (x1, y1) {
        if (x1 < 0) {
            x1 = 100 + x1;
        }
        if (y1 < 0) {
            y1 = 100 + y1;
        }
        x1 -= x1 % chunksize;
        y1 -= y1 % chunksize;
        x1 = x1 / chunksize;
        y1 = y1 / chunksize;
        return [x1, y1].join(",");
    }
    updatechunks () {
        this.chunk = this.getchunk(this.x, this.y);
    }
    __css (index, value) {
        let v = this.outlet.style.cssText.split(";");
        v[index] = v[index].split(":")[0]+":"+{0:this._pos.x,1:this._pos.y,2:this._rot,3:this._color,4:value}[index];
        this.outlet.style.cssText = v.join(";");
    }
    get following () {
        return this._following;
    }
    set following (value) {
        this._following = value;
        if (value !== null) {
            this.__css(4, value.color);
            let t = this._following;
            while (t.following !== null) {
                t = t.following;
            }
            this.top = t;
        } else {
            this.__css(4, "black;");
            this.top = null;
        }
    }
    get pos () {
        return this._pos;
    }
    set pos (value) {
        value.x = value.x % 106;
        value.y = value.y % 106;
        if (value.x < -5) {
            value.x = 105+value.x;
        }
        if (value.x > 105) {
            value.x = 105-value.x;
        }
        if (value.y < -5) {
            value.y = 105+value.y;
        }
        if (value.y > 105) {
            value.y = 105-value.y;
        }
        this._pos = value;
        this.__css(0);
        this.__css(1);
    }
    get x () {
        return this._pos.x;
    }
    set x (value) {
        value = value % 100;
        if (value < 0) {
            value = 100 + value;
        }
        this._pos.x = value;
        this.__css(0);
    }
    get y () {
        return this._pos.y;
    }
    set y (value) {
        value = value % 100;
        if (value < 0) {
            value = 100 + value;
        }
        this._pos.y = value;
        this.__css(1);
    }
    get rot () {
        return this._rot;
    }
    set rot (value) {
        this._rot = value % 360;
        this.__css(2);
    }
    get color () {
        return this._color;
    }
    set color (value) {
        this._color = value;
        this.__css(3);
    }
}

class Main {
    constructor () {
        this.boids = [];
        // 10
        this.swarmsize = 10;
        // 1
        this.boidspeed = 1;
        // 25
        this.boidview = 30;
        // 10
        this.groupview = 10;
        // -5
        this.lowturnneg = -15;
        // 5
        this.lowturnpos = 15;
        // -15
        this.highturnneg = -45;
        // 15
        this.highturnpos = 45;
        // -5
        this.ranturnneg = -5;
        // 5
        this.ranturnpos = 5;
        this.rmin = 0x66;
        this.rmax = 0xaa;
        this.gmin = 0x66;
        this.gmax = 0xaa;
        this.bmin = 0x66;
        this.bmax = 0xaa;
    }
    hex (n) {
        const hd = {0:"0", 1:"1", 2:"2", 3:"3", 4:"4", 5:"5", 6:"6", 7:"7", 8:"8", 9:"9", 10:"a", 11:"b", 12:"c", 13:"d", 14:"e", 15:"f"};
        let f = "";
        f += hd[n % 16];
        n -= n % 16;
        f = hd[n / 16] + f;
        return f;
    }
    populate (max) {
        this.swarmsize = (max===undefined?this.swarmsize:max);
        for (let i = 0; i < this.swarmsize; i ++) {
            this.boids.push(new Boid(randint(0, 100), randint(0, 100), randint(0, 360), "#"+this.hex(randint(this.rmin, this.rmax))+this.hex(randint(this.gmin, this.gmax))+this.hex(randint(this.bmin, this.bmax))));
        }
        if (max === 2) {
            this.boids[0].color = "#00ff00";
            this.boids[1].color = "#aa00ff";
        }
    }
    logic (b, b2) {
        if (new Vector(b.x, b.y, b2.x, b2.y).mag() <= this.boidview) {
            const dif = b2.rot-b.rot;
            b.rot += randint((dif < 0?this.lowturnneg:this.lowturnpos), Math.min(Math.max(dif, this.highturnneg), this.highturnpos));
        }
    }
    upboid (b) {
        // rand -0.5 0.5
        b.rot = b.rot + randint(this.ranturnneg, this.ranturnpos);
        const np = new Vector(0, 1).rot(b.rot).mul(this.boidspeed);
        b.pos = b.pos.sub(np);
        b.updatechunks();
    }
    schunk (x, y) {
        if (x < 0) {
            x = 100/chunksize;
        }
        if (x > 100/chunksize) {
            x = 0;
        }
        if (y < 0) {
            y = 100/chunksize;
        }
        if (y > 100/chunksize) {
            y = 0;
        }
        return [x, y].join(",");
    }
    checkchunk (b, b2) {
        let testing = [b.chunk];
        let mch = b.getchunk(b.x, b.y).split(",");
        mch = new Vector(Number(mch[0]), Number(mch[1]));
        testing.push(this.schunk(mch.x-1, mch.y-1), this.schunk(mch.x, mch.y-1), this.schunk(mch.x+1, mch.y-1), this.schunk(mch.x+1, mch.y), this.schunk(mch.x+1, mch.y+1), this.schunk(mch.x, mch.y+1), this.schunk(mch.x-1, mch.y+1), this.schunk(mch.x-1, mch.y));
        for (let i = 0; i < testing.length; i ++) {
            const c = testing[i];
            if (b2.chunk === c) {
                return false;
            }
        }
        return true;
    }
    getAngle (b, b2) {
        return Math.atan2(b2.y-b.y, b2.x-b.x) * (180/Math.PI);
    }
    update () {
        for (let i = 0; i < this.boids.length; i ++) {
            const b = this.boids[i];
            if (b.following === null) {
                for (let i2 = 0; i2 < this.boids.length; i2 ++) {
                    const b2 = this.boids[i2];
                    if (b2 === b) {
                        continue;
                    }
                    if (b.following === b2 || b2.top === b) {
                        continue
                    }
                    if (this.checkchunk(b, b2)) {
                        continue;
                    }
                    b.following = b2;
                    break;
                }
            }
            if (b.following !== null) {
                const b2 = b.following;
                const dist = new Vector(b.x-b2.x, b.y-b2.y).mag();
                if (dist > this.boidview) {
                    b.following = null;
                } else if (dist > this.groupview) {
                    const ang = this.getAngle(b, b2);
                    b.rot += randint((ang<0?this.lowturnneg:this.lowturnpos), Math.min(Math.max(ang, this.highturnneg), this.highturnpos));
                } else {
                    this.logic(b, b2);
                }
            }
            this.upboid(b);
        }
    }
    list (prop) {
        for (let i = 0; i < this.boids.length; i ++) {
            const boid = this.boids[i];
            console.log("boid "+i+":", (prop===undefined?boid:boid[prop]));
        }
    }
}

Main = new Main();

// 10
Main.populate(10);

const b1 = Main.boids[0];
const b2 = Main.boids[1];

let stopped = true;
// 250
let delay = 75;

function update () {
    if (stopped) {
        return;
    }
    Main.update();
    setTimeout(update, delay);
}

function start () {
    if (!stopped) {
        return;
    }
    stopped = false;
    update();
}

function stop () {
    stopped = true;
}

const grid = document.getElementById("gridlines");

function makeline (pos, hor) {
    const d = document.createElement("div");
    d.className = "gridline";
    d.style.cssText = (hor?"--y:"+pos+";--w:100;":"--x:"+pos+";--h:100;")+"--mul:"+chunksize+";";
    return d;
}

for (let i = 0; i < 100/chunksize; i ++) {
    grid.appendChild(makeline(i, true));
}

for (let i = 0; i < 100/chunksize; i ++) {
    grid.appendChild(makeline(i, false));
}