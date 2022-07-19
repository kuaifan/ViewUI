import Modal from './confirm';
import { resetIncrease, modalVisibleAggregate, modalVisibleWaitList, onModalVisibleClear, onModalVisibleClosing } from '../../utils/transfer-queue';

let modalInstance;

function getModalInstance (render = undefined, lockScroll = true, append = undefined) {
    modalInstance = modalInstance || Modal.newInstance({
        closable: false,
        maskClosable: false,
        footerHide: true,
        render: render,
        append: append,
        lockScroll
    });

    return modalInstance;
}

function confirm (options, again = false) {
    const render = ('render' in options) ? options.render : undefined;
    const lockScroll = ('lockScroll' in options) ? options.lockScroll : true;
    const append = ('append' in options) ? options.append : undefined;
    let instance  = getModalInstance(render, lockScroll, append);

    if ((instance.component.$parent.closing || instance.component.$parent.okIng) && again !== true) {
        setTimeout(() => confirm(options, true), instance.component.$parent.okIng ? 350 : 300)
        return;
    }

    options.onRemove = function () {
        modalInstance = null;
    };

    instance.show(options);
}

Modal.info = function (props = {}) {
    props.icon = 'info';
    props.showCancel = false;
    return confirm(props);
};

Modal.success = function (props = {}) {
    props.icon = 'success';
    props.showCancel = false;
    return confirm(props);
};

Modal.warning = function (props = {}) {
    props.icon = 'warning';
    props.showCancel = false;
    return confirm(props);
};

Modal.error = function (props = {}) {
    props.icon = 'error';
    props.showCancel = false;
    return confirm(props);
};

Modal.confirm = function (props = {}) {
    if (typeof props.icon === 'undefined') {
        props.icon = 'confirm';
    }
    if (typeof props.showCancel === 'undefined') {
        props.showCancel = true;
    }
    return confirm(props);
};

Modal.next = function () {
    const option = modalVisibleWaitList.shift();
    if (option) {
        return confirm(option);
    }
    return null;
};

Modal.remove = function () {
    if (!modalInstance) {   // at loading status, remove after Cancel
        return false;
    }

    const instance = getModalInstance();

    instance.remove();
};

Modal.resetIndex = function () {
    resetIncrease();
};

Modal.visibles = function () {
    onModalVisibleClear()
    return modalVisibleAggregate;
};

Modal.removeLast = function () {
    if (modalVisibleAggregate.length === 0) {
        return false;
    }
    onModalVisibleClear()
    if (!onModalVisibleClosing()) {
        return true;
    }
    const $TopModal = modalVisibleAggregate.sort((a, b) => {
        return a.$data.modalIndex < b.$data.modalIndex ? 1 : -1;
    })[0];
    if ($TopModal) {
        $TopModal.cancel();
        return true;
    } else {
        return false;
    }
};

export default Modal;
