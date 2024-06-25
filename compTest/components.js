class ALU {
    constructor(){

        // setup registers as part of registers buffer
        this.Registers.Int32 = new Int32Array(this.Registers.buffer)
        this.Registers.UInt32 = new Uint32Array(this.Registers.buffer)
        this.Registers.Bytes = new Uint8Array(this.Registers.buffer)
    }
    Registers = {
        buffer: new ArrayBuffer(Int32Array.BYTES_PER_ELEMENT * NUM_REGISTERS),
        Int32: null,
        UInt32: null,
        Bytes: null,
    };

    Load(register, value){
        this._checkValidRegister(register);
        return this._setRegister(register, value)

    }
    From(register){
        this._checkValidRegister(register, true);
        return this.Registers.Int32[register];
    }
    Execute(operation){
        let a = this.Registers.Int32[REGISTERS.A];
        let b = this.Registers.Int32[REGISTERS.B];
        let out;
        switch(operation){
            case OPERATORS.NULL:
                break;
            case OPERATORS.ADD:
                out = a+b;
                break;
            case OPERATORS.SUBTRACT:
                out = a-b;
                break;
            case OPERATORS.AND:
                out = a&b;
                break;
            case OPERATORS.OR:
                out = a|b;
                break;
            case OPERATORS.XOR:
                out = a^b;
                break;
            case OPERATORS.ABSR:
                out = a>>b;
                break;
            case OPERATORS.ABSL:
                out = a<<b;
                break;
                                        // Logical shifts require using registers as UInts, not Ints.
                                        //      thus get and set are overridden.
            case OPERATORS.LBSR:
                a = this.Registers.UInt32[REGISTERS.A]
                b = this.Registers.UInt32[REGISTERS.B]
                out = a/(2**b);
                return this._setRegisterUnsigned(REGISTERS.Q, out)
            case OPERATORS.LBSL:
                a = this.Registers.UInt32[REGISTERS.A]
                b = this.Registers.UInt32[REGISTERS.B]
                out = a*(2**b);
                return this._setRegisterUnsigned(REGISTERS.Q, out)
            
            
            case OPERATORS.LOR:
                out = a||b;
                break;
            case OPERATORS.LAND:
                out = a&&b;
                break;
            case OPERATORS.LXOR:
                out = !!a^!!b;
                break;
            case OPERATORS.TEST:
                if(a>b){
                    out = 1;
                }
                else if(a<b){
                    out = -1;
                }
                else {
                    out = 0;
                }
                break;
            case OPERATORS.GT:
                out = a>b;
                break;
            case OPERATORS.LT:
                out = a<b;
                break;
            case OPERATORS.EQ:
                out = a==b;
                break;
            case OPERATORS.NOT:
                if(a){
                    out = 0;
                }
                else {
                    out = 1;
                }
                break;
            case OPERATORS.BNOT:
                out = ~a;
                break;
            case OPERATORS.NEG:
                out = -a;
                break;

            default:
                throw new Error("Incorrect operator number: "+operation);
        }
        return this._setRegister(REGISTERS.Q, out);
    }
    InitRegView(){
        for(let i=0;i<NUM_REGISTERS;i++){
            document.getElementsByClassName("Register")[i].innerHTML=REGISTER_NAMES[i]+": "+this.Registers.Int32[i];
        }
    }
    Copy(reg1, reg2){
        let val = this.From(reg1);
        this.Load(reg2, val);
    }

    _initRegisters(){
        for(let i=0;i<NUM_REGISTERS;i++){
            this.Registers.Int32[REGISTER_NAMES[i]] = 0;
        }
    }
    _checkValidRegister(register, is_from=false){
        if(register<0 || register>=NUM_REGISTERS){
            return console.warn("Trying to set ALU register out of range!")
        }
        if(register%1 != 0){
            return console.warn("Register number must be an integer!")
        }
        if(!is_from && register==REGISTERS.Q){
            return console.warn("Trying to set ALU output!")
        }

        return;
    }
    _setRegister(register, value){
        document.getElementsByClassName("Register")[register].innerHTML=REGISTER_NAMES[register]+":"+value;
        return (this.Registers.Int32[register] = value);
    }
    _setRegisterUnsigned(register, value){
        this.Registers.UInt32[register] = value;
        document.getElementsByClassName("Register")[register].innerHTML=REGISTER_NAMES[register]+":"+this.Registers.Int32[register];
    }
}

class IO {
    constructor() {

    }

    In() {
        return prompt();
    }
    OutRaw(val) {
        console.log(val)
    }
}

class RAM {
    constructor(length) {
        this._buffer = new ArrayBuffer(this.wordSize * length);
        this._Int32 = new Int32Array(this.buffer);
        this._UInt32 = new Uint32Array(this.buffer);
        this._Bytes = new Uint8Array(this.buffer);
    }

    Access(address, length=1) {
        return this._Int32.slice(address, address+length);
    }
    AccessUnsigned(address, length=1) {
        return this._UInt32.slice(address, address+length);
    }
    AccessBytes(address, length=1) {
        return this._Bytes.slice(address*this.wordSize, address+length);
    }

    Store(address, values) {
        return this._Int32.set(values, address)
    }
    StoreUnsigned(address, values) {
        return this._UInt32.set(values, address)
    }
    StoreBytes(address, values) {
        return this._Bytes.set(values, address)
    }

    wordSize = Int32Array.BYTES_PER_ELEMENT

    _buffer = null;
    _Int32 = null;
    _UInt32 = null;
    _Bytes = null;
}