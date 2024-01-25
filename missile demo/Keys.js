var Keys = {
    keyboard: {
        pressed:{},
        lastPressed: '',
        lastReleased: '',
        debug:false
    },
    mouse: {
        pressed: false,
        position: [0,0],
        scrollValue: 0,
        lastScroll:0,
    }
};

window.addEventListener('keydown', (event) => {
    Keys.keyboard.pressed[event.key] = true;
    Keys.keyboard.lastPressed = event.key;
    if(Keys.keyboard.debug) {
        console.log(event);
    }
});
window.addEventListener('keyup', (event) => {
    Keys.keyboard.pressed[event.key] = false;
    Keys.keyboard.lastReleased = event.key;
    if(Keys.keyboard.debug) {
        console.log(event);
    }
});
window.addEventListener('mousedown', (event) => {
    Keys.mouse.pressed = true;
});
window.addEventListener('mouseup', (event) => {
    Keys.mouse.pressed = false;
});
window.addEventListener('mousemove', (event) => {
    Keys.mouse.position = [event.clientX, event.clientY];
});
window.addEventListener('wheel', (event) => {
    Keys.mouse.scrollValue += event.deltaY>0?1:-1; // easiest way to cast to +/- 1
    Keys.mouse.lastScroll = event.deltaY>0?1:-1; // easiest way to cast to +/- 1
});