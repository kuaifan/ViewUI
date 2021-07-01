let transferIndex = 0;
let lastVisibleIndex = 0;

function transferIncrease() {
    transferIndex++;
}

function lastVisibleIncrease() {
    lastVisibleIndex++;
}

function resetIncrease() {
    transferIndex = 0;
    lastVisibleIndex = 0;
}

export { transferIndex, transferIncrease, lastVisibleIndex, lastVisibleIncrease, resetIncrease };
