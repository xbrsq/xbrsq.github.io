function parse_argument(raw) {
	if(raw[0]=="/"){
		return stack[parse_argument(raw.slice(1))];
	}
	if(raw[0]=="&"){
		return objStack[parse_argument(raw.slice(1))];
	}

	if(~isNaN(parseFloat(raw))){
		return parseFloat(raw);
	}

	return raw;
}

class CommandLibrary {
	
	static all = [];
	constructor(name, commands_in=[]) {
		this.name = name;
		this.commands = [];
		this.addCommandList(commands_in)
		CommandLibrary.all.push(this);
	}

	addCommandList(commandList) {
		for(let i=0;i<commandList.length;i++) {
			commandList[i].comID = "%%name%%.%%comID%%"
			.replace("%%comID%%", commandList[i].comID)
			.replace("%%name%%", this.name);
		}
		this.commands.push(...commandList)
	}

	load() {
		commands.push(...this.commands)
	}


}

var commands = [
	{ // Example
		name: "Example Command",	// name is the name of the command, used in error messages.
		comID: "EXAMPLE",			// comID is the string used to invoke the command.
									// 		CANNOT include spaces. Should be all caps.
		execute: function(data){},	// execute is the function run when the command is invoked. The rest of the line is passed
									//		in as an argument.
	},
	{ // set background color			BGSET
		name: "Background Set",
		comID: "BGSET",
		execute: function(data) {
			scene.background = new THREE.Color(data);
		}
	},
	{ // set camera pitch				PITCH
		name: "Pitch Set",
		comID: "PITCH",
		execute: function(data) {
			controls.pitch = parse_argument(data) * DEG_to_RAD;
		}
	},
	{ // set camera yaw					YAW
		name: "Yaw Set",
		comID: "YAW",
		execute: function(data) {
			controls.yaw = parse_argument(data) * DEG_to_RAD;
		}
	},
	{ // set camera zoom				ZOOM
		name: "Zoom Set",
		comID: "ZOOM",
		execute: function(data) {
			controls.zoom = parse_argument(data);
		}
	},
	{ // set rotation					SETROT
		name: "set rotation",
		comID: "SETROT",
		execute: function(data) {
			let dataAsStrings = data.trim().split(",")
			let dataAsNumbers = [];
			for(let i=0;i<dataAsNumbers.length;i++) {
				dataAsNumbers[i] = parse_argument(dataAsStrings[i]);
			}

			let stackIndex;
			if(dataAsNumbers.length == 3){ // if 4 args, arg0 is objStack index
				offset = 0;
				stackIndex = 1;
			}
			else if(dataAsNumbers.length == 4){ // if 4 args, arg0 is objStack index
				offset = 1;
				stackIndex = dataAsNumbers[0];
			}
			else { // fail if not 3 or 4 arguments
				throw new ArgumentError(
					GenerationError.formatString
					.replace("%%number%%", dataAsNumbers.toString())
				);
			}

			objStack[objStack.length-stackIndex]	// latest object added
				.rotation.set(
					dataAsNumbers[offset+0]*DEG_to_RAD, 
					dataAsNumbers[offset+1]*DEG_to_RAD, 
					dataAsNumbers[offset+2]*DEG_to_RAD
				);
		}
	},
	{ // set position					SETPOS
		name: "set position",
		comID: "SETPOS",
		execute: function(data) {
			let dataAsStrings = data.trim().split(",")
			let dataAsNumbers = [];
			for(let i=0;i<dataAsNumbers.length;i++) {
				dataAsNumbers[i] = parse_argument(dataAsStrings[i]);
			}

			let stackIndex;
			if(dataAsNumbers.length == 3){ // if 4 args, arg0 is objStack index
				offset = 0;
				stackIndex = 1;
			}
			else if(dataAsNumbers.length == 4){ // if 4 args, arg0 is objStack index
				offset = 1;
				stackIndex = dataAsNumbers[0];
			}
			else { // fail if not 3 or 4 arguments
				throw new ArgumentError(
					GenerationError.formatString
					.replace("%%number%%", dataAsNumbers.toString())
				);
			}

			objStack[objStack.length-stackIndex]	// latest object added
				.position.set(
					dataAsNumbers[offset+0]*DEG_to_RAD, 
					dataAsNumbers[offset+1]*DEG_to_RAD, 
					dataAsNumbers[offset+2]*DEG_to_RAD
				);
		}
	},
	{ // set scale						SETSCL
		name: "set scale",
		comID: "SETSCL",
		execute: function(data) {
			let dataAsStrings = data.trim().split(",")
			let dataAsNumbers = [];
			for(let i=0;i<dataAsNumbers.length;i++) {
				dataAsNumbers[i] = parse_argument(dataAsStrings[i]);
			}

			let stackIndex;
			if(dataAsNumbers.length == 3){ // if 4 args, arg0 is objStack index
				offset = 0;
				stackIndex = 1;
			}
			else if(dataAsNumbers.length == 4){ // if 4 args, arg0 is objStack index
				offset = 1;
				stackIndex = dataAsNumbers[0];
			}
			else { // fail if not 3 or 4 arguments
				throw new ArgumentError(
					GenerationError.formatString
					.replace("%%number%%", dataAsNumbers.toString())
				);
			}

			objStack[objStack.length-stackIndex]	// latest object added
				.scale.set(
					dataAsNumbers[offset+0]*DEG_to_RAD, 
					dataAsNumbers[offset+1]*DEG_to_RAD, 
					dataAsNumbers[offset+2]*DEG_to_RAD
				);
		}
	},
	{ // Move To pan center
		name: "Move To pan center",
		comID: "CENTER",
		execute: function(data) { // data is the index to objStack
			objStack[objStack.length-parseInt(data)].position.set(controls.xPan, controls.yPan, controls.zPan)
		}
	},
	{ // DEBUG
		name: "DEBUG",
		comID: "DEBUG",
		execute: function(data) {
			console.log(parse_argument(data));
		}
	},
	{ // SUPERKILL
		name: "Stop Everything",
		comID: "SUPERKILL",
		execute: function(data) {
			running = false;
		}
	},
	{ // import lib
		name: "Import Library",
		comID: "IMPORT",
		execute: function(data) {
			data = data.trim;
			for(let i=0;i<CommandLibrary.all.length;i++) {
				if(CommandLibrary.all[i].name = data) {
					CommandLibrary.all[i].load();
				}
			}
		}
	},
	{ // 
		name: "",
		comID: "",
		execute: function(data) {
			
		}
	}
]



const Stack = new CommandLibrary("STACK", [
	{ // conditional execute
		name: "Conditional Execute",
		comID: "IF",
		execute: function(data) {
			let index = data.search(" ");
			let condition = parse_argument(data.slice(0, index));
			let command = data.slice(index+1);

			if(condition>0){
				single_command_from_string(command);
			}

		}
	},
	{ // set stack value
		name: "Stack Set",
		comID: "SET",
		execute: function(data) {
			data = data.split(" ");

			let pos = parse_argument(data[0]);
			let val = parse_argument(data[0]);

			stack[pos] = val;
		}
	},
	{ // push to stack
		name: "Push to stack",
		comID: "PUSH",
		execute: function(data) {
			stack.push(parse_argument(data));
		}
	},
	{ // stack operation
		name: "Do Operation on Stack",
		comID: "OP",
		execute: function(data) {
			data = data.split(" ");
			let a = parse_argument(data[0]);
			let op = data[1];
			let b = parse_argument(data[2]);
			let c = a;

			switch(op) { // all the operators
				case '+':
					c+=b;
					break;
				case '-':
					c-=b;
					break;
				case '*':
					c*=b;
					break;
				case '/':
					c/=b;
					break;
				case '%':
					c%=b;
					break;
				case '>>':
					c=a>>b;
					break;
				case '<<':
					c=a<<b;
					break;
				case '&':
					c=a&b;
					break;
				case '|':
					c=a|b;
					break;
				case '^':
					c=a^b;
					break;
				case '<':
					c=a<b;
					break;
				case '>':
					c=a>b;
					break;
				case '==':
					c=a==b;
					break;
				case '!=':
					c=a!=b;
					break;
				case '<=':
					c=a<=b;
					break;
				case '>=':
					c=a>=b;
					break;
				case '=':
					c=a;
					break;
				default:
					throw new Error("Incorrect operator: "+op);
			}

			if(typeof(c) == 'boolean'){
				c = c?1:0; // cast to int
			}
			
			stack[parse_argument(data[3])] = c;
		}
	}
]);