<template>
    <div>
        <Upload
            ref="aa"
            :on-progress="progress"
            multiple
            type="drag"
            paste
            action="http://127.0.0.1:2222/api/upload">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                <p>Click or drag files here to upload</p>
            </div>
        </Upload>
        <div style="display: flex;flex-direction: column;line-height: 30px;">
            <a v-for="item in items" @click="cancel(item)" href="javascript:void(0)">Cancel {{ item.name }}</a>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            items: [],
        }
    },
    methods: {
        cancel(item) {
            if (this.$refs.aa.cancel(item.uid)) {
                item.name = item.name + ' (canceled)';
            }
        },
        progress(e, file) {
            if (!this.items.find(item => item.uid === file.uid)) {
                this.items.push(file);
            }
        }
    }
}
</script>
