
document.getElementById('dummy-solve-game').addEventListener('click', () => {
    console.log("Solve game asked");
    chrome.runtime.sendMessage({ type: 'SOLVE_GAME', full:false });
});


document.getElementById('solve-game').addEventListener('click', () => {
    console.log("Solve game asked");
    chrome.runtime.sendMessage({ type: 'SOLVE_GAME', full:true });
});