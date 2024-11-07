const delay = ms => new Promise(res => setTimeout(res, ms));

// click_listener.js
chrome.storage.local.get('runOnClick', (result) => {
    if (result.runOnClick) {
        const send = chrome.runtime.sendMessage;
        document.addEventListener('click', async (event) => {
            console.log("Click somewhere", event);
            
            await delay(300);
            send({ type: 'SOLVE_GAME' });
            
            
            // Only proceed if the click is within the Minesweeper game area
            // const gameArea = document.getElementById('game'); // Adjust this selector as needed
            // if (gameArea && gameArea.contains(event.target)) {
            //     chrome.runtime.sendMessage({ type: 'TRIGGER_SOLVE' });
            // }
        });

        document.addEventListener('keyup', (event) => {
            console.log("keyup somewhere", event);

            if (event.code === 'KeyR')
                send({ type: 'SOLVE_GAME' });
            
            // Only proceed if the click is within the Minesweeper game area
            // const gameArea = document.getElementById('game'); // Adjust this selector as needed
            // if (gameArea && gameArea.contains(event.target)) {
            //     chrome.runtime.sendMessage({ type: 'TRIGGER_SOLVE' });
            // }
        });

    }
});

console.log("Click_listener here !");