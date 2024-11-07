function handleMessage(message) {
    if (message.type === 'UPDATE_VISUALS') {
        const { cellsToFlag, cellsToOpen } = message.data;

        // Apply classes specifically for minesweeperonline.com
        cellsToFlag.forEach(cell => {
            const cellElement = document.getElementById(`${cell.y}_${cell.x}`);
            if (cellElement) {
                cellElement.classList.add('flagged-cell');
            }
        });

        cellsToOpen.forEach(cell => {
            const cellElement = document.getElementById(`${cell.y}_${cell.x}`);
            if (cellElement) {
                cellElement.classList.add('openable-cell');
            }
        });
    }
}

chrome.runtime.onMessage.addListener(handleMessage);