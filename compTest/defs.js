let p=0;
const OPERATORS = {
    NULL: p++,
    ADD:  p,
    PLUS: p++,      // add=plus
    SUB:  p,
    SUBTRACT: p++,  // sub=subtract
    BOR:   p++,
    BAND:  p++,
    BXOR:  p++,
    ABSR:  p++,
    ABSL:  p++,
    LBSR:  p++,
    LBSL:  p++,
    LOR:  p++,
    LAND: p++,
    LXOR: p++,
    TEST: p++,
    GT:   p++,
    LT:   p++,
    EQ:   p++,
    LNOT: p,
    NOT:  p++,
    BNOT: p++,
    NEG:  p++,
}


let o=p;
const OPCODES = {
    ...OPERATORS,
    LOADA: o++,
    LOADB: o++,
    LOADX: o++,
    LOADY: o++,
    COPY: o++,
    OUT: o++,
    GOTO: o++,
    STOP:o++,
    IFGOTO:o++,
    MARKER:255,

    IN: o++,
    GETRAM:  o++,
    SETRAM:  o++,
};
const NUM_OPCODES = o;


let r=0;
const REGISTERS = {
    A:r++,
    B:r++,
    C:r  ,
    Q:r++, // this sets C and Q as aliases (both for out)
    X:r++,
    Y:r++,
}
const NUM_REGISTERS = r;
const REGISTER_NAMES = [
    "A",
    "B",
    "C",
    "X",
    "Y",
]