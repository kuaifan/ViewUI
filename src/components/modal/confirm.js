import Vue from 'vue';
import Modal from './modal.vue';
import ModalAlive from './modal-alive.vue';
import Button from '../button/button.vue';
import Locale from '../../mixins/locale';

const prefixCls = 'ivu-modal-confirm';

Modal.newInstance = properties => {
    const _props = properties || {};

    const Instance = new Vue({
        mixins: [ Locale ],
        data: Object.assign({}, _props, {
            visible: false,
            width: 416,
            title: '',
            body: '',
            iconType: '',
            iconName: '',
            okText: undefined,
            cancelText: undefined,
            okType: null,
            cancelType: null,
            showCancel: false,
            loading: false,
            buttonLoading: false,
            scrollable: false,
            closable: false,
            closing: false, // 关闭有动画，期间使用此属性避免重复点击
            okIng: false,
            enterOk: false,
        }),
        render (h) {
            let footerVNodes = [];
            if (this.showCancel) {
                footerVNodes.push(h(Button, {
                    props: {
                        type: this.cancelType || 'text'
                    },
                    on: {
                        click: () => {
                            this.cancel(true)
                        }
                    }
                }, this.localeCancelText));
            }
            footerVNodes.push(h(Button, {
                props: {
                    type: this.okType || 'primary',
                    loading: this.buttonLoading
                },
                on: {
                    click: this.ok
                }
            }, this.localeOkText));

            // render content
            let body_render;
            if (this.render) {
                body_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-body ${prefixCls}-body-render`
                    }
                }, [this.render(h)]);
            } else {
                body_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-body`
                    }
                }, [
                    h('div', {
                        domProps: {
                            innerHTML: this.body
                        }
                    })
                ]);
            }

            // when render with no title, hide head
            let head_render;
            if (this.title) {
                head_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-head`
                    }
                }, [
                    h('div', {
                        class: this.iconTypeCls
                    }, [
                        h('i', {
                            class: this.iconNameCls
                        })
                    ]),
                    h('div', {
                        attrs: {
                            class: `${prefixCls}-head-title`
                        },
                        domProps: {
                            innerHTML: this.title
                        }
                    })
                ]);
            }

            return h(Modal, {
                props: Object.assign({}, _props, {
                    width: this.width,
                    scrollable: this.scrollable,
                    closable: this.closable,
                    enterOk: this.enterOk
                }),
                domProps: {
                    value: this.visible
                },
                on: {
                    input: (status) => {
                        this.visible = status;
                    },
                    'on-cancel': this.cancel
                }
            }, [
                h('div', {
                    attrs: {
                        class: prefixCls
                    }
                }, [
                    head_render,
                    body_render,
                    h('div', {
                        attrs: {
                            class: `${prefixCls}-footer`
                        }
                    }, footerVNodes)
                ])
            ]);
        },
        computed: {
            iconTypeCls () {
                return [
                    `${prefixCls}-head-icon`,
                    `${prefixCls}-head-icon-${this.iconType}`
                ];
            },
            iconNameCls () {
                return [
                    'ivu-icon',
                    `ivu-icon-${this.iconName}`
                ];
            },
            localeOkText () {
                if (this.okText) {
                    return this.okText;
                } else {
                    return this.t('i.modal.okText');
                }
            },
            localeCancelText () {
                if (this.cancelText) {
                    return this.cancelText;
                } else {
                    return this.t('i.modal.cancelText');
                }
            }
        },
        methods: {
            cancel (isButton = false) {
                if (this.closing) return;
                this.$children[0].visible = false;
                this.buttonLoading = false;
                this.onCancel(isButton);
                this.remove();
            },
            ok () {
                if (this.closing) return;
                if (this.loading) {
                    this.buttonLoading = true;
                } else {
                    this.$children[0].visible = false;
                    this.remove();
                }

                this.okIng = true;
                const call = this.onOk();
                if (call && call.then) {
                    call.then(() => {
                        this.$children[0].visible = false;
                        this.remove();
                    }).catch(() => {
                        this.buttonLoading = false;
                    }).finally(_ => {
                        this.okIng = false;
                    });
                } else {
                    this.okIng = false;
                }
            },
            remove () {
                this.closing = true;
                setTimeout(() => {
                    this.closing = false;
                    this.destroy();
                }, 300);
            },
            destroy () {
                this.$destroy();
                if (this.$el) {
                    try {
                        if (this.append && typeof this.append === 'object') {
                            this.append.removeChild(this.$el);
                        } else {
                            document.body.removeChild(this.$el);
                        }
                    } catch (e) {

                    }
                }
                this.onRemove();
            },
            onOk () {},
            onCancel () {},
            onRemove () {}
        }
    });

    const component = Instance.$mount();
    if (_props.append && typeof _props.append === 'object') {
        _props.append.appendChild(component.$el);
    } else {
        document.body.appendChild(component.$el);
    }
    const modal = Instance.$children[0];

    return {
        show (props) {
            modal.$parent.showCancel = props.showCancel;
            modal.$parent.iconType = props.icon;

            switch (props.icon) {
                case 'info':
                    modal.$parent.iconName = 'ios-information-circle';
                    break;
                case 'success':
                    modal.$parent.iconName = 'ios-checkmark-circle';
                    break;
                case 'warning':
                    modal.$parent.iconName = 'ios-alert';
                    break;
                case 'error':
                    modal.$parent.iconName = 'ios-close-circle';
                    break;
                case 'confirm':
                    modal.$parent.iconName = 'ios-help-circle';
                    break;
            }

            if ('width' in props) {
                modal.$parent.width = props.width;
            }

            if ('closable' in props) {
                modal.$parent.closable = props.closable;
            }

            if ('title' in props) {
                modal.$parent.title = props.title;
            }

            if ('content' in props) {
                modal.$parent.body = props.content;
            }

            if ('okText' in props) {
                modal.$parent.okText = props.okText;
            }

            if ('cancelText' in props) {
                modal.$parent.cancelText = props.cancelText;
            }

            if ('okType' in props) {
                modal.$parent.okType = props.okType;
            }

            if ('cancelType' in props) {
                modal.$parent.cancelType = props.cancelType;
            }

            if ('onCancel' in props) {
                modal.$parent.onCancel = props.onCancel;
            }

            if ('onOk' in props) {
                modal.$parent.onOk = props.onOk;
            }

            // async for ok
            if ('loading' in props) {
                modal.$parent.loading = props.loading;
            }

            if ('scrollable' in props) {
                modal.$parent.scrollable = props.scrollable;
            }

            if ('enterOk' in props) {
                modal.$parent.enterOk = props.enterOk;
            }

            // notice when component destroy
            modal.$parent.onRemove = props.onRemove;

            modal.visible = true;
        },
        remove () {
            modal.visible = false;
            modal.$parent.buttonLoading = false;
            modal.$parent.remove();
        },
        component: modal
    };
};

Modal.Alive = ModalAlive

export default Modal;
