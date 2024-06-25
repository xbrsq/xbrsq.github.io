const ASSEMBLER = function(){
    let t = {}

    t._output = [];

    t.AssInstr = [
        {sym:"ADD",code:OPCODES.ADD},
        {sym:"SUB",code:OPCODES.SUB},
        {sym:"BOR",code:OPCODES.BOR},
        {sym:"BAND",code:OPCODES.BAND},
        {sym:"BXOR",code:OPCODES.BXOR},
        {sym:"ABSR",code:OPCODES.ABSR},
        {sym:"ABSL",code:OPCODES.ABSL},
        {sym:"LBSR",code:OPCODES.LBSR},
        {sym:"LBSL",code:OPCODES.LBSL},
        {sym:"LOR",code:OPCODES.LOR},
        {sym:"LAND",code:OPCODES.LAND},
        {sym:"LXOR",code:OPCODES.LXOR},
        {sym:"TEST",code:OPCODES.TEST},
        {sym:"GT",code:OPCODES.GT},
        {sym:"LT",code:OPCODES.LT},
        {sym:"EQ",code:OPCODES.EQ},
        {sym:"LNOT",code:OPCODES.LNOT},
        {sym:"BNOT",code:OPCODES.BNOT},
        {sym:"NEG",code:OPCODES.NEG},

        {sym:"LOADA",code:OPCODES.LOADA},
        {sym:"LOADB",code:OPCODES.LOADB},
        {sym:"LOADX",code:OPCODES.LOADX},
        {sym:"LOADY",code:OPCODES.LOADY},
        {sym:"COPY",code:OPCODES.COPY},
        {sym:"OUT",code:OPCODES.OUT},
        {sym:"GOTO",code:OPCODES.GOTO},
        {sym:"STOP",code:OPCODES.STOP},
        {sym:"IFGOTO",code:OPCODES.IFGOTO}
    ];

    t.specialSymbols = {
        "#": function(line, metadata){ // comment
            return;
        },
        ":": function(line, metadata){ // label
            metadata.labels.push({text:line.slice(1),pos:metadata.bytePos});
            return;
        },
    }

    t.argTypes = [ // default is #0
        {sym:"\0",func:function(arg, metadata){ // dummy
            return [0];
        }, num:true},
        {sym:"b",func:function(arg, metadata){ // byte
            return  [intToByte(arg)];
        }, num:true},
        {sym:"s",func:function(arg, metadata){ // short (16)
            return  int16ToBytes(arg);
        }, num:true},
        {sym:"i",func:function(arg, metadata){ // int (32)
            return  int32ToBytes(arg);
        }, num:true},
        {sym:"r",func:function(arg, metadata){ // int (32)
            for(let i=0;i<REGISTER_NAMES.length;i++){
                if(REGISTER_NAMES[i]==arg) {
                    return [intToByte(i)];
                }
            }
        }, num:false},
        {sym:":",func:function(arg, metadata){ // Rom position (label)
            metadata.labelsToInstall.push({text:arg,pos:metadata.bytePos});
            return  int32ToBytes(0);
        }, num:false},
    ]

    t.checkStartsWith = function(line, startCheck) {
        /** check if (line) starts with (startCheck). Returns boolean.
        */
        let startLine = line.substring(0, startCheck.length);
        return startLine==startCheck;
    }

    t.handleArg = function(arg, metadata){
        if(!arg){
            return;
        }
        for(let i=0;i<this.argTypes.length;i++){
            if(this.argTypes[i].sym == arg.substring(0,this.argTypes[i].sym.length)){
                let typedArg = arg.substring(this.argTypes[i].sym.length);
                if(this.argTypes[i].num){
                    typedArg = parseInt(typedArg);
                    if(isNaN(typedArg)){
                        throw new Error("arg is not int: "+arg.substring(this.argTypes[i].sym.length))
                    }
                }

                return this.argTypes[i].func(typedArg, metadata);
            }
        }
        return [];
    }

    t.assembleLine = function(line, metadata){
        /** assemble the entire line
        */
        if(!line){
            // line is empty
            return;
        }
        if(this.specialSymbols[line[0]]){
            return this.specialSymbols[line[0]](line, metadata);
        }
        // handle starting
        let foundmatch = false;
        for(let i=0;i<this.AssInstr.length;i++){
            if(this.checkStartsWith(line, this.AssInstr[i].sym)){
                this._output.push(this.AssInstr[i].code);
                foundmatch = true;
                break;
            }
        }
        metadata.bytePos+=1; // length of instruction
        if(!foundmatch){
            console.error("Cannot find proper instruction for line: "+line)
        }
        
        
        // handle arguments
        let args = line.split(" ");
        for(let i=1;i<args.length;i++){
            let bytes = this.handleArg(args[i], metadata);
            if(bytes){
                metadata.bytePos+=bytes.length; // arg length
                this._output.push(...bytes);
            }
        }
        
    }

    t.compileToBuffer = function(flush=true){
        let compiled = new Int8Array(this._output);
        if(flush){
            this._output = [];
        }
        console.log(hex_encode(compiled));
        return compiled;
    }

    t.assembleLines = function(lines){
        // first pass, leaving dynamic portions until later.

        let metadata = {labels:[],labelsToInstall:[], bytePos:0};
        let linesArr = lines.split("\n");
        for(let i=0;i<linesArr.length;i++){
            this.assembleLine(linesArr[i], metadata)
        }

        // console.log(metadata)

        // console.log("before: "+this._output.slice());

        // install labels
        for(let i=0;i<metadata.labelsToInstall.length;i++){
            for(let j=0;j<metadata.labels.length;j++){
                // console.log(i,j)
                // console.log(metadata.labelsToInstall[i],metadata.labels[j])
                if(metadata.labelsToInstall[i].text==metadata.labels[j].text){
                    let labelpos = int32ToBytes(metadata.labels[j].pos);
                    for(let k=0;k<Int32Array.BYTES_PER_ELEMENT;k++){
                        // don't have to de-reverse it, because it is already backwards.
                        this._output[metadata.labelsToInstall[i].pos+k] = labelpos[k]
                    }
                    // console.log("replaced values for")
                    // console.log(metadata.labelsToInstall[i])
                    // console.log("with label")
                    // console.log(metadata.labels[i])
                }
            }
        }
        // console.log("after: ")
        // console.log(this._output.slice());

        // console.log("\n")
        
        return this.compileToBuffer();
    }

    return t;
}();