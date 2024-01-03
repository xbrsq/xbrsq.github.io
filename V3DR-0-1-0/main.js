if(IMPORT_SCRIPTS=true) {
    let keyscript = document.createElement('script');
    keyscript.src = 'keys.js';
    document.head.appendChild(keyscript);

    let genscript = document.createElement('script');
    genscript.src = 'generators.js';
    document.head.appendChild(genscript);

    let comscript = document.createElement('script');
    comscript.src = 'commands.js';
    document.head.appendChild(comscript);

    let script = document.createElement('script');

    // Set the source to the Three.js CDN or local path
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';

    // Define a function to be executed after the script loads
    script.onload = function () {
    // Code to execute after Three.js is loaded
    init();
    // console.log('Three.js has been loaded!');
    };

    // Append the script element to the head of the document
    document.head.appendChild(script);
}




class GenerationError extends Error {
    constructor(message) {
      super(message);
      this.name = "GenerationError"; 
    }
    static formatString = "Error generating %%name%%: Encountered %%other%%"
}

class ArgumentError extends Error {
    constructor(message) {
      super(message);
      this.name = "ArgumentError"; 
    }
    static formatString = "Incorrect number of arguments: %%number%%";
}

let scene, camera, renderer, controls, objStack, stack, tickCode, running=true;

controls = {

    zoom: 4,
    zoomSpeed: 0.01,

    pitch: 0,
    pitchSpeed: 0.01,

    yaw: 0,
    yawSpeed: 0.01,

    xPan: 0,
    yPan: 0,
    zPan: 0,

    yPanSpeed: 0.03,
    xzPanSpeed: 0.1,
    
    update: function(){
        this.updateCamera()

        if(window.keys.ArrowUp){
            this.pitch += this.pitchSpeed;
        }
        if(window.keys.ArrowDown){
            this.pitch -= this.pitchSpeed;
        }
        if(window.keys.ArrowRight){
            this.yaw += this.yawSpeed;
        }
        if(window.keys.ArrowLeft){
            this.yaw -= this.yawSpeed;
        }

        if(window.keys.PageUp){
            this.zoom /= this.zoomSpeed + 1;
        }
        if(window.keys.PageDown){
            this.zoom *= this.zoomSpeed + 1;
        }

        if(window.keys.w){
            this.xPan -= Math.cos(this.yaw)*this.xzPanSpeed;
            this.zPan -= Math.sin(this.yaw)*this.xzPanSpeed;
        }
        if(window.keys.s){
            this.xPan += Math.cos(this.yaw)*this.xzPanSpeed;
            this.zPan += Math.sin(this.yaw)*this.xzPanSpeed;
        }
        if(window.keys.a){
            this.xPan += Math.cos(this.yaw+(90*DEG_to_RAD))*this.xzPanSpeed;
            this.zPan += Math.sin(this.yaw+(90*DEG_to_RAD))*this.xzPanSpeed;
        }
        if(window.keys.d){
            this.xPan -= Math.cos(this.yaw+(90*DEG_to_RAD))*this.xzPanSpeed;
            this.zPan -= Math.sin(this.yaw+(90*DEG_to_RAD))*this.xzPanSpeed;
        }
        
    },

    updateCamera: function(){
        let x,y,z, ux,uy,uz; // u is for up
        x = this.zoom * Math.cos(this.yaw) * Math.cos(this.pitch);
        z = this.zoom * Math.sin(this.yaw) * Math.cos(this.pitch);
        y = this.zoom * Math.sin(this.pitch);

        ux = Math.cos(this.yaw) * Math.cos(this.pitch+(90*DEG_to_RAD));
        uz = Math.sin(this.yaw) * Math.cos(this.pitch+(90*DEG_to_RAD));
        uy = Math.sin(this.pitch+(90*DEG_to_RAD));        // I have no idea why 1 works as a value ¯\_(ツ)_/¯
                                            // if you do what it should be (90*DEG_to_RAD), then
                                            // it has a slight bit of roll while pressing a yaw key

        camera.position.x = x + this.xPan;
        camera.position.y = y + this.yPan;
        camera.position.z = z + this.zPan;

        camera.lookAt(this.xPan, this.yPan, this.zPan);
        camera.up = new THREE.Vector3(ux,uy,uz)
    }

}

objStack = [];
stack = [];
tickCode = [];

function gen_object(type, argument_array) {
    if(argument_array.length==0) {
        return;
    }

    let obj,i;

    for(i=1;i<generators.length;i++) { // start at 1 because Example Object is #0.
        if(type==generators[i].genID) {
            try {
                obj = generators[i].generate(...argument_array)
                i=100000000; // break out of for loop, because I have had poor experiences with break and if interactions.
            }
            catch(err) {
                throw new GenerationError(
                    GenerationError.formatString
                    .replace("%%name%%", generators[i].name)
                    .replace("%%other%%", err.message));
            }
        }
    }
    if(i!=100000001){
        throw new GenerationError(
            GenerationError.formatString
            .replace("%%name%%", "object")
            .replace("%%other%%", "unknown type: "+type));
    }

    scene.add(obj);
    objStack.push(obj);

    return obj;
}

function single_gen_from_string(input_string) {
    let input = input_string.split(";");
    let type = input[0];      // which generator to use
    let data= input.slice(1); // data fed to generator for arguments

    for(let i=0;i<data.length;i++) {
        if(data[i].search(",")!=-1){    // if the data includes a comma, split it into multiple subentries (for pos, rot, etc.)
            data[i] = data[i].split(",");
            for(let j=0;j<data[i].length;j++) {
                data[i][j] = parseFloat(data[i][j]); // all data should be in numerical format
            }
        }
        else {
            if(!isNaN(parseFloat(data[i]))){
                data[i] = parseFloat(data[i]);
            }
        }
    }

    return gen_object(type, data);
}

function multi_from_string(input_string) {
    let lines = input_string.split("\n");
    let line;
    for(let n=0;n<lines.length;n++) {
        line=lines[n];
        if(line==""){
            continue;
        }
        switch(lines[n][0]) {
            case "+":                    // add object
                single_gen_from_string(line.slice(1));
                break;
            case ":":                   // command
                single_command_from_string(line.slice(1))
                break;
            case "~":                   // code that runs every tick
                tickCode.push(line.slice(1));
                break;
            default:    //unknown identifier
                console.log("Unknown identifier: "+lines[n][0]+" on line "+n);
        }
    }
}

function single_command_from_string(input_string) {
    let dist_to_space = input_string.search(" ");
    if(dist_to_space<0) {
        dist_to_space = input_string.length;
    }
    let comName = input_string.slice(0,dist_to_space);
    let data = input_string.slice(dist_to_space+1);
    
    for(let i=0;i<commands.length;i++){
        if(comName == commands[i].comID) {
            commands[i].execute(data);
            return;
        }
    }
    throw new Error("Unknown comName: "+comName)
}

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth*0.98, window.innerHeight*0.98);
    document.body.appendChild(renderer.domElement);

    animate();

    multi_from_string(
        ":IMPORT STACK\n"+
        "+cyl;0,0,0;0,0,0;0.2;0.2;black;0.9\n"+
        "+cyl;0,3,0;0,0,0;2;0.2;green;0.9\n" +
        "+cyl;0,-3,0;0,0,0;2;0.2;purple;0.9\n" +
        "+cyl;3,0,0;0,0,90;2;0.2;magenta;0.9\n" +
        ":BGSET red\n:ZOOM 10\n"+
        ":STACK.PUSH 1\n"+ // current yaw
        ":STACK.PUSH 1\n"+ // current dyaw
        ":STACK.PUSH 0\n"+ // temp output for condition
        "~:STACK.OP /0 + /1 0\n"+
        "~:STACK.OP /0 >= 180 2\n"+
        "~:STACK.IF /2 STACK.OP /1 * -1 1\n"+
        "~:STACK.OP /0 <= -180 2\n"+
        "~:STACK.IF /2 STACK.OP /1 * -1 1\n"+
        "~:YAW /0\n"

        
        
        
        //+
        // "~:DEBUG /0\n"
        
    )
}

function animate() {
    if(running){
        requestAnimationFrame(animate);
    }
    controls.update()
    renderer.render(scene, camera);

    for(let i=0;i<tickCode.length;i++) {
        multi_from_string(tickCode[i]);
    }
}

function startup() {
    running = true;
    requestAnimationFrame(animate);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth*0.98, window.innerHeight*0.98);
}

window.addEventListener('resize', onWindowResize);

function genDebugObjects() {
    for(let i=1;i<generators.length;i++){
        console.log(i);
        o = gen_object(generators[i].genID, [[i*8, 0, 0], [0,0,0], 3,3,3,3,3,3,3])
    }
}