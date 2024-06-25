

var Alu = new ALU();
var Cpu = new CPU(ROM);
Cpu.Io.OutRaw = function(data) {
    // console.log(Cpu.InstructionPointer);
    document.getElementById("console").innerHTML += "<span class=consoleEntry>$data</span><br>".replace("$data", data.toString())
}

function test(){
    Alu.InitRegView();
    Alu.Load(REGISTERS.A, 2147483647);
    Alu.Load(REGISTERS.X, 1);
    Alu.Load(REGISTERS.B, Alu.From(REGISTERS.X, 16));
    Alu.Load(REGISTERS.X, 0);
    Alu.Execute(OPERATORS.LBSL);
}

function step(){
    Cpu.ExecNextInstruction();
    Cpu.Alu.InitRegView()
}

function compile(){
    let data = document.getElementById("ROM_IN").value;
    Cpu.Rom = ASSEMBLER.assembleLines(data);
}

var MAX_INSTRUCTION_COUNT = 1000;

function run(){
    Cpu.InstructionPointer = 0;
    document.getElementById("console").innerHTML = '';
    for(let i=0;i<MAX_INSTRUCTION_COUNT;i++){
        if(Cpu.ExecNextInstruction()){
            console.log("Execution stopped by CPU.");
            return;
        }
    }
    console.log("Too Many instructions!")
}