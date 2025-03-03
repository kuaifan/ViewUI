<template>
    <div v-transfer-dom :data-transfer="transfer">
        <transition :name="transitionNames[1]">
            <div :class="maskClasses" :style="wrapStyles" v-show="visible" v-if="showMask" @click="handleMask"></div>
        </transition>
        <div :class="wrapClasses" :style="wrapStyles" @click="handleWrapClick">
            <transition :name="transitionNames[0]" @after-leave="animationFinish">
                <div :class="classes" :style="mainStyles" v-show="visible" @mousedown="handleMousedown">
                    <div :class="contentClasses" ref="content" :style="contentStyles" @click="handleClickModal">
                        <a :class="[prefixCls + '-close']" v-if="closable" @click="close">
                            <slot name="close">
                                <Icon type="ios-close"></Icon>
                            </slot>
                        </a>
                        <div :class="[prefixCls + '-header']"
                             @mousedown="handleMoveStart"
                             v-if="showHead"
                        ><slot name="header"><div :class="[prefixCls + '-header-inner']">{{ title }}</div></slot></div>
                        <div :class="[prefixCls + '-body']"><slot></slot></div>
                        <div :class="[prefixCls + '-footer']" v-if="!footerHide">
                            <slot name="footer">
                                <i-button type="text" @click.native="cancel">{{ localeCancelText }}</i-button>
                                <i-button type="primary" :loading="buttonLoading" @click.native="ok">{{ localeOkText }}</i-button>
                            </slot>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
import CommonMixin from './common-mixin.js'

export default {
    name: 'ModalAlive',
    mixins: [CommonMixin],
}
</script>
