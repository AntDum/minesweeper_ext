
document.addEventListener('DOMContentLoaded', () => {
    const solveButton = document.getElementById('solve-game');
    const runOnClickCheckbox = document.getElementById('run-on-click');
    
    console.log("Add listener");

    // Get stored state for "Run on Click" checkbox
    chrome.storage.local.get(['runOnClick'], (result) => {
        runOnClickCheckbox.checked = result.runOnClick || false;
    });

    // Toggle "Run on Click" state
    runOnClickCheckbox.addEventListener('change', () => {
        const isChecked = runOnClickCheckbox.checked;
        chrome.storage.local.set({ runOnClick: isChecked });
        console.log("Change state");
    });

    // Manually trigger solve when button is clicked
    solveButton.addEventListener('click', () => {
        triggerSolve();
        console.log("Button click");
    });
});

function triggerSolve() {
    chrome.runtime.sendMessage({ type: 'SOLVE_GAME' });
}

var isInjected = false;
