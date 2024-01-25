var ctx,canvas;

function init() {
    canvas = document.getElementById("main")
    canvas.width = 2000;
    canvas.height = canvas.width / (visualViewport.width/visualViewport.height);
    ctx = canvas.getContext("2d");
    
    requestAnimationFrame(frame);
}

function frame(time){
    requestAnimationFrame(frame);
    if(frame.time==null){
        frame.time = time;
        return;
    }

    // clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = frame.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // tick

    for(let i=0;i<frame.funcs.length;i++){ 
        frame.funcs[i](frame.deltaTime);
    }

    for(let i=0;i<ObjStub.All.length;i++){ 
        if(!ObjStub.All[i].active){
            continue
        }
        ObjStub.All[i].tick(frame.deltaTime)
    }

    for(let i=0;i<ObjStub.All.length;i++){ 
        if(!ObjStub.All[i].active){
            continue
        }
        ObjStub.All[i].render()
    }


    frame.deltaTime = (time-frame.time)/1000; // div by 1000 to convert ms to s
    frame.deltaTime *= frame.timeScale;
    frame.time = time;

}
frame.time = null;
frame.deltaTime=0;
frame.timeScale = 1;
frame.bgColor="red";
frame.funcs = [];

function square(pos=[0,0],color="white",size=5) {
    let r = size/2;
    ctx.fillStyle=color;
    ctx.fillRect(
        pos[0] - r,
        pos[1] - r,

        size,
        size
    );
}
function line(start=[0,0], delta=[1,1], color="white") {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(
        start[0]+delta[0],
        start[1]+delta[1]
    );
    ctx.stroke();
}

function avg_angles(a1, a2, weights=[1,1]) {
    a1 %= Math.PI*2;
    a2 %= Math.PI*2;
    if(a2-a1>Math.PI){
        a2-=Math.PI*2
    }
    if(a1-a2>Math.PI){
        a2+=Math.PI*2
    }

    out = (
        (
            (weights[0]*a1)+
            (weights[1]*a2)
        )
        /
        (weights[0]+weights[1])
    );
    
    return out

}

function diff_angles(a1, a2, weights=[1,1]) {
    a1 %= Math.PI*2;
    a2 %= Math.PI*2;

    // console.log(a1, a2)
    return a1-a2;
}

function dir_to(p1, p2) {
    let dx = p2[0]-p1[0];
    let dy = p2[1]-p1[1];

    if(dx==0){
        dx = 1e-6;
    }
    let tdir = Math.atan(dy/dx);
    if(dx<0){
        tdir += Math.PI;
    }
    if(tdir-this.dir>Math.PI){
        tdir-=Math.PI*2
    }
    if(this.dir-tdir>Math.PI){
        tdir+=Math.PI*2
    }

    tdir %= Math.PI*2

    return tdir
}

function dist_to(p1, p2) {
    let dx = p2[0]-p1[0];
    let dy = p2[1]-p1[1];

    let sqr = (dx**2)+(dy**2)
    return Math.sqrt(sqr);
}

function polar_to_rect(angle, mag){
    return [Math.cos(angle)*mag, Math.sin(angle)*mag];

}

function setInfoBox(id, str) {
    document.getElementById("infobox:"+id).innerHTML = str;
}

class ObjStub{
    constructor(pos=[0,0], vel=[0,0], color="black") {
        this.pos = pos;
        this.vel = vel;

        this.color = color

        this.velLineScale = 0.3

        this.active = true;

        ObjStub.All.push(this);
    }

    tick(dT) {
        this.pos[0] += this.vel[0]*dT;
        this.pos[1] += this.vel[1]*dT;

        if(Keys.keyboard.pressed["y"]) {
            a.vel = [-10,1];
        }

        return;
    }

    render() {
        square(this.pos, this.color, 10);
        line(this.pos, [this.vel[0]*this.velLineScale, this.vel[1]*this.velLineScale], this.color);
        return;
    }

    static All = [];

}

class TargetDrone extends ObjStub {
    constructor(pos, vel, color, keys=["","a","","d"]){
        super(pos, vel, color);
        this.keys = keys;
        this.dir = 0;
        this.spd = 50;

        this.acc = 20;

        this.turnPower = 5
    }

    tick(dT) {
        super.tick(dT);

        if(Keys.keyboard.pressed[this.keys[0]]){
            this.spd += this.acc * dT;
        }
        if(Keys.keyboard.pressed[this.keys[1]]){
            this.dir -= this.turnPower * dT;
        }
        if(Keys.keyboard.pressed[this.keys[2]]){
            this.spd -= this.acc * dT;
        }
        if(Keys.keyboard.pressed[this.keys[3]]){
            this.dir += this.turnPower * dT;
        }

        this.vel = [Math.cos(this.dir)*this.spd, Math.sin(this.dir)*this.spd];
    }
    render() {
        super.render();
        square(this.pos, "black", 1)
    }
}

class SWMissile extends ObjStub {
    constructor(pos, vel, color, target) {
        super(pos, vel, color);
        this.target = target;

        this.dir = 0;
        this.spd = 30;
    }

    tick(dT) {
        super.tick(dT);
        
        let dx = this.target.pos[0]-this.pos[0];
        let dy = this.target.pos[1]-this.pos[1];

        if(dx==0){
            dx = 1e-6;
        }
        let tdir = Math.atan(dy/dx);
        if(dx<0){
            tdir += Math.PI;
        }

        if(tdir-this.dir>Math.PI){
            tdir-=Math.PI*2
        }
        if(this.dir-tdir>Math.PI){
            tdir+=Math.PI*2
        }

        let balanceOld = 10
        let balanceNew = 1
        // this.dir = ((balanceOld*this.dir)+(balanceNew*tdir))/(balanceNew+balanceOld);
        this.dir = avg_angles(tdir, this.dir, [balanceNew, balanceOld])


        this.vel = [Math.cos(this.dir)*this.spd, Math.sin(this.dir)*this.spd];
    }
}

class CAMissile extends ObjStub {
    constructor(pos, vel, color, target) {
        super(pos, vel, color);
        this.target = target;

        this.dir = 0;
        this.spd = 30;

        this.heldAngle = (45 /360)*Math.PI
        this.dirChange = 0;
    }

    tick(dT) {
        super.tick(dT);

        this.fix_dir();

        let tdir = dir_to(this.pos, this.target.pos);

        let newdir = tdir+this.heldAngle;
        this.dirChange = newdir-this.dir;
        this.dir += this.dirChange;
        this.fix_dir();

        if(Math.sign(this.heldAngle)*(this.dir-tdir)<0){
            this.heldAngle *= -1;
        }

        this.vel = [Math.cos(this.dir)*this.spd, Math.sin(this.dir)*this.spd];
    }

    fix_dir() {
        this.dir %= Math.PI*2
    }
}

class CADMissile extends ObjStub {
    constructor(pos, vel, color, target) {
        super(pos, vel, color);

        this.target = target;

        this.dir = 0;
        this.dirvel = 0;
        this.dirAttenuation=0.9;
        this.spd = 100;

        this.PIDControls = {P:1000, I:0, D:0};

        this.PID = {P:0, I:0, D:0}

        this.lastTickTargetDir = 0;
        this.prevError = 0;

        this.terminalGuidanceRange = 50
    }
    tick(dT) {

        let tdir=dir_to(this.pos, this.target.pos);

        if(dist_to(this.pos, this.target.pos)<this.terminalGuidanceRange){
            this.dir = tdir;
        }

        this.dir += this.dirvel*dT;

        let deltaTDir=tdir-this.lastTickTargetDir;
        let dirError = diff_angles(tdir, this.dir);

        this.PID.P = deltaTDir;
        this.PID.I += dirError*dT;
        this.PID.D = (dirError - this.prevError) / (dT+0.001)

        this.dirvel = (
            (this.PID.P * this.PIDControls.P)+
            (this.PID.I * this.PIDControls.I)+
            (this.PID.D * this.PIDControls.D)
        )


        this.prevError = deltaTDir;


        this.dir *= Math.pow(this.dirAttenuation, dT);


        super.tick(dT);

        this.lastTickTargetDir = tdir;
        
        this.vel = polar_to_rect(this.dir, this.spd);
    }
}

class AccMissile extends CADMissile {
    constructor(pos, vel, color, target) {
        super(pos, vel, color, target);

        this.acc = 10;
        this.acctime = 10;
    }

    tick(dT) {
        if(this.acctime>0){
            this.spd += this.acc*dT;
            this.acctime -= dT;
        }
        super.tick(dT);
    }
}

class RotPoint extends ObjStub {
    constructor(center, r, color) {
        super(center, [0,0], color);
        this.c = center;
        this.c2 = [...center];
        this.dir = 0;
        this.r =r;
    }
    tick(dT) {
        this.vel = [0,0];
        this.c = this.c2;
        this.pos[0] = this.c[0] + (Math.cos(this.dir)*this.r);
        this.pos[1] = this.c[1] + (Math.sin(this.dir)*this.r);

    }
}




var a = new TargetDrone([500,100], [100,30], "green")
// var b = new SWMissile([20, 80], [0,0], "blue", a);
// var c = new CADMissile([30, 90], [0,0], "purple", a);
a.spd = 80;
// b.spd = 60;
// c.spd = 100;

var missile={};


frame.funcs.push(function() {
    if(Keys.keyboard.pressed[","]){
        frame.timeScale *= 0.9
    }
    if(Keys.keyboard.pressed["."]){
        frame.timeScale /= 0.9
    }
    if(Keys.keyboard.pressed["/"]){
        frame.timeScale = 1
    }
    setInfoBox("0", "Timescale: "+Math.round(frame.timeScale*1000)/1000)
});

frame.funcs.push(function() {
    if(Keys.keyboard.pressed["`"]) {
        missile.active = false;
        return;
    }
    if(Keys.keyboard.pressed["1"]) {
        missile.active = false;
        missile = new SWMissile([20, 80], [0,0], "blue", a);
        missile.spd = 100
        return;
    }
    if(Keys.keyboard.pressed["2"]) {
        missile.active = false;
        missile = new CADMissile([20, 80], [0,0], "black", a);
        missile.spd = 100
        return;
    }
    if(Keys.keyboard.pressed["3"]) {
        missile.active = false;
        missile = new AccMissile([20, 80], [0,0], "black", a);
        missile.dir = dir_to(missile.pos, a.pos);
        missile.spd = 0
        missile.acc = 100
        missile.acctime = 3
        return;
    }
    
    if(Keys.keyboard.pressed["4"]) {
        missile.active = false;
        missile = new AccMissile([20, 80], [0,0], "black", a);
        missile.dir = dir_to(missile.pos, a.pos);
        missile.spd = 800
        missile.acc = 0
        missile.acctime = 0
        return;
    }
    
})