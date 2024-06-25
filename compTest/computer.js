class CPU {
    constructor(rom=new Uint8Array()) {
        this.Alu = new ALU();
        this.Io = new IO();
        this.Ram = new RAM(8)
        this.Rom = rom;
    }
    
    ExecNextInstruction(){
        // returns whether the Cpu encountered a stop condition
        let instruction = this.GetNextRomBytes();
        if (instruction==undefined){
            console.log("Ran out of ROM:"+this.InstructionPointer);
            return true;
        }
        // console.log(--this.InstructionPointer,this.GetNextRomBytes());
        switch(instruction) {
            case OPCODES.ADD:
                this.Alu.Execute(OPERATORS.ADD)
                break;
            case OPCODES.SUB:
                this.Alu.Execute(OPERATORS.SUB)
                break;
            case OPCODES.BOR:
                this.Alu.Execute(OPERATORS.BOR)
                break;
            case OPCODES.BAND:
                this.Alu.Execute(OPERATORS.BAND)
                break;
            case OPCODES.BXOR:
                this.Alu.Execute(OPERATORS.BXOR)
                break;
            case OPCODES.ABSR:
                this.Alu.Execute(OPERATORS.ABSR)
                break;
            case OPCODES.ABSL:
                this.Alu.Execute(OPERATORS.ABSL)
                break;
            case OPCODES.LBSR:
                this.Alu.Execute(OPERATORS.LBSR)
                break;
            case OPCODES.LBSL:
                this.Alu.Execute(OPERATORS.LBSL)
                break;
            case OPCODES.LOR:
                this.Alu.Execute(OPERATORS.LOR)
                break;
            case OPCODES.LAND:
                this.Alu.Execute(OPERATORS.LAND)
                break;
            case OPCODES.LXOR:
                this.Alu.Execute(OPERATORS.LXOR)
                break;
            case OPCODES.TEST:
                this.Alu.Execute(OPERATORS.TEST)
                break;
            case OPCODES.GT:
                this.Alu.Execute(OPERATORS.GT)
                break;
            case OPCODES.LT:
                this.Alu.Execute(OPERATORS.LT)
                break;
            case OPCODES.EQ:
                this.Alu.Execute(OPERATORS.EQ)
                break;
            case OPCODES.LNOT:
                this.Alu.Execute(OPERATORS.NOT)
                break;
            case OPCODES.BNOT:
                this.Alu.Execute(OPERATORS.NOT)
                break;
            case OPCODES.NEG:
                this.Alu.Execute(OPERATORS.NEG)
                break;
            case OPCODES.LOADA:
                this.Alu.Load(REGISTERS.A, this.GetNextRomWords())
                break;
            case OPCODES.LOADB:
                this.Alu.Load(REGISTERS.B, this.GetNextRomWords())
                break;
            case OPCODES.LOADX:
                this.Alu.Load(REGISTERS.X, this.GetNextRomWords())
                break;
            case OPCODES.LOADY:
                this.Alu.Load(REGISTERS.Y, this.GetNextRomWords())
                break;
            case OPCODES.COPY:
                let from = this.GetNextRomBytes();
                let to = this.GetNextRomBytes();
                this.Alu.Load(
                    to,
                    this.Alu.From(from)
                )
                break;
            case OPCODES.OUT:
                this.Io.OutRaw(this.Alu.Registers.Int32[this.GetNextRomBytes()])
                break;
            case OPCODES.GOTO:
                this.InstructionPointer = this.GetNextRomWords();
                break;

            case OPCODES.STOP:
                return true;

            case OPCODES.IFGOTO:
                let testedvalue = this.Alu.From(this.GetNextRomBytes());
                let addr = this.GetNextRomWords();
                // console.log("---");
                // console.log("value,address:");
                // console.log(testedvalue)
                // console.log(addr)
                // console.log("---");
                if(testedvalue!=0){
                    this.InstructionPointer = addr;
                }
                break;

            case OPCODES.MARKER:
                break;
            
            default:
                console.warn("instruction not implemented: " + instruction+" on byte ", this.InstructionPointer-1);
            }
        return false
    }

    GetNextRomBytes(length=1){ // get the next [length] bytes, incrementing the instruction pointer
        let rtrn = this.Rom.slice(this.InstructionPointer, this.InstructionPointer+length);
        this.InstructionPointer+=length;
        if(length==1){
            return rtrn[0]; //if only 1 value, just return it without the buffer wrapper
        }
        return rtrn;
    }
    GetNextRomWords(length=1){ // get the next [length] words, incrementing the instruction pointer
        let bytes = this.Rom.slice(this.InstructionPointer, this.InstructionPointer+(length*Int32Array.BYTES_PER_ELEMENT));
        for(let i=0;i<bytes.length/2;i++){
            bytes[i]=bytes[bytes.length-i-1];
        }
        let int32s = new Int32Array(bytes);
        this.InstructionPointer+=length*Int32Array.BYTES_PER_ELEMENT;
        if(length==1){
            return int32s[0]; //if only 1 value, just return it without the buffer wrapper
        }
        return int32s;
    }

    Alu = null;
    Io = null;
    Ram = null;
    Rom = null;
    InstructionPointer = 0;
}