import Modal from './confirm';
import { resetIncrease, modalVisibleAggregate } from '../../utils/transfer-queue';

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

function confirm (options) {
    const render = ('render' in options) ? options.render : undefined;
    const lockScroll = ('lockScroll' in options) ? options.lockScroll : true;
    const append = ('append' in options) ? options.append : undefined;
    let instance  = getModalInstance(render, lockScroll, append);

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
    props.icon = 'confirm';
    props.showCancel = true;
    return confirm(props);
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

Modal.removeLast = function () {
    if (modalVisibleAggregate.length === 0) {
        return false;
    }
    modalVisibleAggregate[modalVisibleAggregate.length - 1].close();
    return true;
};

export default Modal;
