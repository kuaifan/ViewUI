import Icon from '../icon';
import iButton from '../button/button.vue';
import TransferDom from '../../directives/transfer-dom';
import Locale from '../../mixins/locale';
import Emitter from '../../mixins/emitter';
import ScrollbarMixins from './mixins-scrollbar';

import { on, off } from '../../utils/dom';
import { findComponentsDownward, deepCopy } from '../../utils/assist';

import {
    getTransferIndex as modalIndex,
    transferIncrease as modalIncrease,
    lastVisibleIndex,
    lastVisibleIncrease,
    modalVisibleAggregate,
    modalVisibleListens,
    hasTransferIndex
} from '../../utils/transfer-queue';

const prefixCls = 'ivu-modal';

const dragData = {
    x: null,
    y: null,
    dragX: null,
    dragY: null,
    dragging: false,
    rect: null
};

export default {
    mixins: [ Locale, Emitter, ScrollbarMixins ],
    components: { Icon, iButton },
    directives: { TransferDom },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: true
        },
        maskClosable: {
            type: Boolean,
            default () {
                return !this.$IVIEW || this.$IVIEW.modal.maskClosable === '' ? true : this.$IVIEW.modal.maskClosable;
            }
        },
        title: {
            type: String
        },
        width: {
            type: [Number, String],
            default: 520
        },
        okText: {
            type: String
        },
        cancelText: {
            type: String
        },
        enterOk: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        styles: {
            type: Object,
            default () {
                return {};
            }
        },
        className: {
            type: String
        },
        // for instance
        footerHide: {
            type: Boolean,
            default: false
        },
        scrollable: {
            type: Boolean,
            default: false
        },
        transitionNames: {
            type: Array,
            default () {
                return ['ease', 'fade'];
            }
        },
        transfer: {
            type: Boolean,
            default () {
                return !this.$IVIEW || this.$IVIEW.transfer === '' ? true : this.$IVIEW.transfer;
            }
        },
        fullscreen: {
            type: Boolean,
            default: false
        },
        mask: {
            type: Boolean,
            default: true
        },
        draggable: {
            type: Boolean,
            default: false
        },
        // 4.6.0
        sticky: {
            type: Boolean,
            default: false
        },
        // 4.6.0
        stickyDistance: {
            type: Number,
            default: 10
        },
        // 4.6.0
        resetDragPosition: {
            type: Boolean,
            default: false
        },
        // 忽略集合触发 removeLast 关闭
        ignoreRemoveLast: {
            type: Boolean,
            default: false
        },
        // 用于回调 VisibleListener
        tag: {
            default: null
        },
        zIndex: {
            type: Number,
            default: 1000
        },
        beforeClose: Function
    },
    data () {
        return {
            prefixCls: prefixCls,
            wrapShow: false,
            showHead: true,
            buttonLoading: false,
            visible: this.value,
            dragData: deepCopy(dragData),
            modalIndex: this.handleGetModalIndex(),  // for Esc close the top modal
            isMouseTriggerIn: false, // #5800
            contentShake: false,
        };
    },
    computed: {
        wrapClasses () {
            return [
                `${prefixCls}-wrap`,
                {
                    [`${prefixCls}-hidden`]: !this.wrapShow,
                    [`${this.className}`]: !!this.className,
                    [`${prefixCls}-no-mask`]: !this.showMask
                }
            ];
        },
        wrapStyles () {
            return {
                zIndex: hasTransferIndex(this.modalIndex, this.modalIndex + this.zIndex)
            };
        },
        maskClasses () {
            return `${prefixCls}-mask`;
        },
        classes () {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-fullscreen`]: this.fullscreen,
                    [`${prefixCls}-fullscreen-no-header`]: this.fullscreen && !this.showHead,
                    [`${prefixCls}-fullscreen-no-footer`]: this.fullscreen && this.footerHide
                }
            ];
        },
        contentClasses () {
            return [
                `${prefixCls}-content`,
                {
                    [`${prefixCls}-content-no-mask`]: !this.showMask,
                    [`${prefixCls}-content-drag`]: this.draggable && !this.fullscreen,
                    [`${prefixCls}-content-dragging`]: this.draggable && this.dragData.dragging,
                    [`${prefixCls}-content-shake`]: this.contentShake
                }
            ];
        },
        mainStyles () {
            let style = {};

            const width = parseInt(this.width);
            const styleWidth = this.dragData.x !== null ? {
                top: 0
            } : {
                width: width <= 100 ? `${width}%` : `${width}px`
            };

            const customStyle = this.styles ? this.styles : {};

            Object.assign(style, styleWidth, customStyle);

            return style;
        },
        contentStyles () {
            let style = {};

            if (this.draggable && !this.fullscreen) {
                const customTop = this.styles.top ? parseFloat(this.styles.top) : 0;
                const customLeft = this.styles.left ? parseFloat(this.styles.left) : 0;
                if (this.dragData.x !== null) style.left = `${this.dragData.x - customLeft}px`;
                if (this.dragData.y !== null) style.top = `${this.dragData.y}px`;
                if (this.dragData.y !== null) style.top = `${this.dragData.y - customTop}px`;

                const width = parseInt(this.width);
                const styleWidth = {
                    width: width <= 100 ? `${width}%` : `${width}px`
                };

                Object.assign(style, styleWidth);
            }

            return style;
        },
        localeOkText () {
            if (this.okText === undefined) {
                return this.t('i.modal.okText');
            } else {
                return this.okText;
            }
        },
        localeCancelText () {
            if (this.cancelText === undefined) {
                return this.t('i.modal.cancelText');
            } else {
                return this.cancelText;
            }
        },
        showMask () {
            return this.mask;
        }
    },
    methods: {
        close () {
            if (!this.beforeClose) {
                return this.handleClose();
            }

            const before = this.beforeClose();

            if (before && before.then) {
                before.then(() => {
                    this.handleClose();
                });
            } else {
                this.handleClose();
            }
        },
        handleClose () {
            this.visible = false;
            this.$emit('input', false);
            this.$emit('on-cancel');
        },
        handleMask () {
            if (this.maskClosable && this.showMask) {
                this.close();
            }
        },
        handleWrapClick (event) {
            if (this.isMouseTriggerIn) {
                this.isMouseTriggerIn = false;
                return;
            }
            // use indexOf,do not use === ,because ivu-modal-wrap can have other custom className
            const className = event.target.getAttribute('class');
            if (className && className.indexOf(`${prefixCls}-wrap`) > -1) this.handleMask();
        },
        handleMousedown () {
            this.isMouseTriggerIn = true;
        },
        shake() {
            this.contentShake = true;
            setTimeout(() => {
                this.contentShake = false;
            }, 500);
        },
        cancel () {
            this.close();
        },
        ok () {
            if (this.loading) {
                this.buttonLoading = true;
            } else {
                this.visible = false;
                this.$emit('input', false);
            }
            this.$emit('on-ok');
        },
        EscClose (e) {
            if (this.CheckEnterOk(e)) {
                return;
            }
            if (this.$IVIEW.modal.checkEscClose === true) {
                this.EscCheckClose(e);
                return;
            }
            if (this.visible && this.closable) {
                if (e.keyCode === 27) {
                    const $Modals = findComponentsDownward(this.$root, this.$options.name).filter(item => item.$data.visible && item.$props.closable);

                    const $TopModal = $Modals.sort((a, b) => {
                        return a.$data.modalIndex < b.$data.modalIndex ? 1 : -1;
                    })[0];

                    setTimeout(() => {
                        $TopModal.close();
                    }, 0);
                }
            }
        },
        CheckEnterOk(e) {
            if (this.visible) {
                if (e.keyCode === 13) {
                    const $TopModal = this.getTopModal();
                    if ($TopModal.$props.enterOk) {
                        e.preventDefault()
                        $TopModal.ok()
                        return true
                    }
                }
            }
            return false
        },
        EscCheckClose (e) {
            if (this.visible) {
                if (e.keyCode === 27) {
                    const $TopModal = this.getTopModal();
                    if (!$TopModal.$props.closable) {
                        $TopModal.shake();
                        return;
                    }

                    setTimeout(() => {
                        $TopModal.cancel();
                    }, 0);
                }
            }
        },
        animationFinish() {
            this.$emit('on-hidden');
        },
        handleMoveStart (event) {
            if (!this.draggable || this.fullscreen) return false;

            const $content = this.$refs.content;
            const rect = $content.getBoundingClientRect();

            this.dragData.rect = rect;
            this.dragData.x = rect.x || rect.left;
            this.dragData.y = rect.y || rect.top;

            const distance = {
                x: event.clientX,
                y: event.clientY
            };

            this.dragData.dragX = distance.x;
            this.dragData.dragY = distance.y;

            this.dragData.dragging = true;

            on(window, 'mousemove', this.handleMoveMove);
            on(window, 'mouseup', this.handleMoveEnd);
        },
        handleMoveMove (event) {
            if (!this.dragData.dragging || this.fullscreen) return false;

            const distance = {
                x: event.clientX,
                y: event.clientY
            };

            const diff_distance = {
                x: distance.x - this.dragData.dragX,
                y: distance.y - this.dragData.dragY
            };

            if (this.sticky) {
                const clientWidth = document.documentElement.clientWidth;
                const clientHeight = document.documentElement.clientHeight;

                if ((this.dragData.x + diff_distance.x <= this.stickyDistance) && diff_distance.x < 0) {
                    this.dragData.x = 0;
                } else if ((this.dragData.x + this.dragData.rect.width - clientWidth > -this.stickyDistance) && diff_distance.x > 0) {
                    this.dragData.x = clientWidth - this.dragData.rect.width;
                } else {
                    this.dragData.x += diff_distance.x;
                }

                if ((this.dragData.y + diff_distance.y <= this.stickyDistance) && diff_distance.y < 0) {
                    this.dragData.y = 0;
                } else if ((this.dragData.y + this.dragData.rect.height - clientHeight > -this.stickyDistance) && diff_distance.y > 0) {
                    this.dragData.y = clientHeight - this.dragData.rect.height;
                } else {
                    this.dragData.y += diff_distance.y;
                }
            } else {
                this.dragData.x += diff_distance.x;
                this.dragData.y += diff_distance.y;
            }

            this.dragData.dragX = distance.x;
            this.dragData.dragY = distance.y;
        },
        handleMoveEnd () {
            this.dragData.dragging = false;
            off(window, 'mousemove', this.handleMoveMove);
            off(window, 'mouseup', this.handleMoveEnd);
        },
        handleGetModalIndex () {
            modalIncrease();
            return modalIndex();
        },
        handleClickModal () {
            if (this.draggable) {
                if (lastVisibleIndex !== this.lastVisibleIndex){
                    this.lastVisibleIndex = lastVisibleIndex;
                    return;
                }
                this.modalIndex = this.handleGetModalIndex();
            }
        },
        handleMoveTop() {
            this.modalIndex = this.handleGetModalIndex();
            lastVisibleIncrease();
        },
        getTopModal() {
            return modalVisibleAggregate.sort((a, b) => {
                return a.$data.modalIndex < b.$data.modalIndex ? 1 : -1;
            })[0]
        },
        isTopModal () {
            const $TopModal = this.getTopModal();
            return !!($TopModal && $TopModal._uid === this._uid);
        },
    },
    mounted () {
        if (this.visible) {
            this.wrapShow = true;
        }

        let showHead = true;

        if (this.$slots.header === undefined && !this.title) {
            showHead = false;
        }

        this.showHead = showHead;

        // ESC close
        document.addEventListener('keydown', this.EscClose);
    },
    beforeDestroy () {
        document.removeEventListener('keydown', this.EscClose);
        this.removeScrollEffect();
    },
    watch: {
        value (val) {
            this.visible = val;
        },
        visible (val) {
            if (this._uid) {
                const index =  modalVisibleAggregate.findIndex(({_uid}) => _uid === this._uid);
                if (val && index === -1) {
                    modalVisibleAggregate.push({
                        _uid: this._uid,
                        tag: this.tag,
                        $data: this.$data,
                        $props: this.$props,
                        ok: this.ok,
                        cancel: this.cancel,
                        shake: this.shake
                    });
                    modalVisibleListens.forEach(cb => {
                        cb(true, {
                            _uid: this._uid,
                            tag: this.tag,
                            mask: this.mask,
                            visible: this.visible,
                        });
                    })
                }
                if (!val && index > -1) {
                    modalVisibleAggregate.splice(index, 1);
                    modalVisibleListens.forEach(cb => {
                        cb(false, {
                            _uid: this._uid,
                            tag: this.tag,
                            mask: this.mask,
                            visible: this.visible,
                        });
                    })
                }
            }
            //
            if (val === false) {
                this.buttonLoading = false;
                this.timer = setTimeout(() => {
                    this.wrapShow = false;
                    this.removeScrollEffect();
                }, 300);
            } else {
                if (this.lastVisible !== val) {
                    this.handleMoveTop();
                }

                if (this.timer) clearTimeout(this.timer);
                this.wrapShow = true;
                if (!this.scrollable) {
                    this.addScrollEffect();
                }
            }
            this.broadcast('Table', 'on-visible-change', val);
            this.broadcast('Slider', 'on-visible-change', val);  // #2852
            this.$emit('on-visible-change', val);
            this.lastVisible = val;
            this.lastVisibleIndex = lastVisibleIndex;
            if (val && this.resetDragPosition) {
                this.dragData = deepCopy(dragData);
            }
        },
        loading (val) {
            if (!val) {
                this.buttonLoading = false;
            }
        },
        scrollable (val) {
            if (!val) {
                this.addScrollEffect();
            } else {
                this.removeScrollEffect();
            }
        },
        title (val) {
            if (this.$slots.header === undefined) {
                this.showHead = !!val;
            }
        }
    }
};
