let transferIndex = 0;
let lastVisibleIndex = 0;
let modalVisibleAggregate = [];
let modalVisibleClosing = false;

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

function onModalVisibleClear() {
    modalVisibleAggregate = modalVisibleAggregate.filter(({$data}) => $data.visible)
}

function onModalVisibleClosing() {
    if (modalVisibleClosing) {
        return false;
    }
    modalVisibleClosing = true;
    setTimeout(() => {
        modalVisibleClosing = false;
    }, 300);
    return true;
}

export { transferIndex, transferIncrease, lastVisibleIndex, lastVisibleIncrease, resetIncrease, modalVisibleAggregate, onModalVisibleClear, onModalVisibleClosing };
