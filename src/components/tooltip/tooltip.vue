<template>
    <div :class="[prefixCls]" @mouseenter="handleShowPopper" @mouseleave="handleClosePopper">
        <div :class="[prefixCls + '-rel']" ref="reference">
            <slot></slot>
        </div>
        <transition name="fade">
            <div
                :class="dropdownCls"
                :style="dropStyles"
                ref="popper"
                v-show="!disabled && (visible || always)"
                @mouseenter="handleShowPopper"
                @mouseleave="handleClosePopper"
                :data-transfer="transfer"
                v-transfer-dom>
                <div :class="[prefixCls + '-content']">
                    <div :class="[prefixCls + '-arrow']"></div>
                    <div :class="innerClasses" :style="innerStyles"><slot name="content">{{ content }}</slot></div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import Popper from '../base/popper';
    import TransferDom from '../../directives/transfer-dom';
    import { oneOf } from '../../utils/assist';
    import {getTransferIndex, hasTransferIndex, transferIncrease} from '../../utils/transfer-queue';

    const prefixCls = 'ivu-tooltip';

    export default {
        name: 'Tooltip',
        directives: { TransferDom },
        mixins: [Popper],
        props: {
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']);
                },
                default: 'bottom'
            },
            content: {
                type: [String, Number],
                default: ''
            },
            delay: {
                type: Number,
                default: 100
            },
            disabled: {
                type: Boolean,
                default: false
            },
            controlled: {    // under this prop,Tooltip will not close when mouseleave
                type: Boolean,
                default: false
            },
            always: {
                type: Boolean,
                default: false
            },
            transfer: {
                type: Boolean,
                default () {
                    return !this.$IVIEW || this.$IVIEW.transfer === '' ? false : this.$IVIEW.transfer;
                }
            },
            theme: {
                validator (value) {
                    return oneOf(value, ['dark', 'light']);
                },
                default: 'dark'
            },
            maxWidth: {
                type: [String, Number]
            },
            transferClassName: {
                type: String
            },
            rawIndex: {
                type: [String, Number],
                default: null
            },
        },
        data () {
            return {
                prefixCls: prefixCls,
                tIndex: this.handleGetIndex()
            };
        },
        computed: {
            innerStyles () {
                const styles = {};
                if (this.maxWidth) styles['max-width'] = `${this.maxWidth}px`;
                return styles;
            },
            innerClasses () {
                return [
                    `${prefixCls}-inner`,
                    {
                        [`${prefixCls}-inner-with-width`]: !!this.maxWidth
                    }
                ];
            },
            dropStyles () {
                let styles = {};
                if (this.rawIndex !== null) {
                    styles['z-index'] = this.rawIndex;
                } else {
                    if (this.transfer) styles['z-index'] = hasTransferIndex(this.tIndex, 1060 + this.tIndex);
                }

                return styles;
            },
            dropdownCls () {
                return [
                    `${prefixCls}-popper`,
                    `${prefixCls}-${this.theme}`,
                    {
                        [prefixCls + '-transfer']: this.transfer,
                        [this.transferClassName]: this.transferClassName
                    }
                ];
            }
        },
        watch: {
            content () {
                this.updatePopper();
            }
        },
        methods: {
            handleShowPopper() {
                if (this.timeout) clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.visible = true;
                }, this.delay);
                this.tIndex = this.handleGetIndex();
            },
            handleClosePopper() {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                    if (!this.controlled) {
                        this.timeout = setTimeout(() => {
                            this.visible = false;
                        }, 100);
                    }
                }
            },
            handleGetIndex () {
                transferIncrease();
                return getTransferIndex();
            },
        },
        mounted () {
            if (this.always) {
                this.updatePopper();
            }
        }
    };
</script>
