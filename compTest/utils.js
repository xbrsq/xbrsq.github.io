function int32ToBytes (int) {
    return [
        (int >> 24) & 0xff,
        (int >> 16) & 0xff,
        (int >> 8) & 0xff,
        int & 0xff,
    ]
}
function int16ToBytes (int) {
    return [
        (int >> 8) & 0xff,
        int & 0xff,
    ]
}
function intToByte (int) {
    return int & 0xff;
}
function hex_decode(string) {
    let bytes = [];
    string.replace(/../g, function (pair) {
        bytes.push(parseInt(pair, 16));
    });
    return new Uint8Array(bytes);
}
function hex_encode(uint8buffer) {
    let rtrn="";
    for(let i=0;i<uint8buffer.length;i++){
        rtrn += uint8buffer[i].toString(16).padStart(2,"0");
    }
    return rtrn;
}