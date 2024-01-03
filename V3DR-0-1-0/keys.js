window.keys = [];

window.addEventListener('keydown', (event) => {
  // 'event.key' will give you the value of the pressed key
  const keyPressed = event.key;

  window.keys[event.key] = true;

  // You can perform actions based on the pressed key
  // console.log('Key pressed:', keyPressed);
});

window.addEventListener('keyup', (event) => {
    // 'event.key' will give you the value of the pressed key
    const keyPressed = event.key;

    window.keys[event.key] = false;
    
    // You can perform actions based on the pressed key
    // console.log('Key up:', keyPressed);
  });
    