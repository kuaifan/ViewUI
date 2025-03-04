let transferIndex = 0;
let lastVisibleIndex = 0;
let modalVisibleAggregate = [];
let modalVisibleListens = [];
let modalVisibleClosing = false;

let modalVisibleWaitList = [];
let modalConfirmGroup = {
    load: 0,
    list: [],
};

function transferIncrease() {
    transferIndex++;
    if (typeof window.modalTransferIndex === "number") {
        window.modalTransferIndex++
    }
}

function hasTransferIndex(hasValue, elseValue) {
    if (typeof window.modalTransferIndex === "number") {
        return hasValue
    }
    return elseValue
}

function getTransferIndex() {
    if (typeof window.modalTransferIndex === "number") {
        return window.modalTransferIndex
    }
    return transferIndex
}

function lastVisibleIncrease() {
    lastVisibleIndex++;
}

function resetIncrease() {
    transferIndex = 0;
    if (typeof window.modalTransferIndex === "number") {
        window.modalTransferIndex = 0
    }
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

export { transferIndex, transferIncrease, getTransferIndex, hasTransferIndex, lastVisibleIndex, lastVisibleIncrease, resetIncrease, modalVisibleAggregate, modalVisibleListens, onModalVisibleClear, onModalVisibleClosing, modalVisibleWaitList, modalConfirmGroup};
