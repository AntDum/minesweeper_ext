
chrome.runtime.onMessage.addListener((message) => {
    console.log("Message on tab");
    if (message.type === 'UPDATE_VISUALS') {
        const { cellsToFlag, cellsToOpen } = message.data;

        // Apply classes specifically for minesweeperonline.com
        cellsToFlag.forEach(cell => {
            const cellElement = document.getElementById(`cell_${cell.x}_${cell.y}`);
            if (cellElement) {
                cellElement.classList.add('flagged-cell');
            }
        });

        cellsToOpen.forEach(cell => {
            const cellElement = document.getElementById(`cell_${cell.x}_${cell.y}`);
            if (cellElement) {
                cellElement.classList.add('openable-cell');
            }
        });
    }
});
