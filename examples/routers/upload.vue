<template>
    <div>
        <Upload
            ref="aa"
            :before-upload="handleBeforeUpload"
            :on-progress="handleProgress"
            :on-success="handleSuccess"
            :on-error="handleError"
            :on-remove="handleRemove"
            :on-preview="handlePreview"
            :on-exceeded-size="handleExceededSize"
            :on-format-error="handleFormatError"
            :maxConcurrentUploads="1"
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
            <a v-for="item in items" :key="item.uid" @click="cancel(item)" href="javascript:void(0)">Cancel {{ item.name }}</a>
        </div>
        <div style="margin-top: 20px;">
            <h3>Upload Event Logs</h3>
            <ul style="max-height: 240px; overflow-y: auto; padding-left: 16px;">
                <li v-if="!logs.length" style="color: #999;">No events yet.</li>
                <li v-for="log in logs" :key="log.id">
                    <span style="color: #2d8cf0; font-weight: 600;">{{ log.time }}</span>
                    <span style="margin-left: 8px;">{{ log.event }}</span>
                    <span style="margin-left: 8px; color: #666;">{{ log.detail }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            items: [],
            logs: []
        }
    },
    methods: {
        cancel(item) {
            if (this.$refs.aa.cancel(item.uid)) {
                item.name = item.name + ' (canceled)';
                this.pushLog('cancel', `cancel request for ${item.name}`);
            }
        },
        handleBeforeUpload(file) {
            this.pushLog('before-upload', `ready to upload ${file.name}`);
            return true;
        },
        handleProgress(e, file) {
            if (!this.items.find(item => item.uid === file.uid)) {
                this.items.push(file);
            }
            const percent = e ? Math.round(e.percent || 0) : 0;
            this.pushLog('on-progress', `${file.name} ${percent}%`);
        },
        handleSuccess(res, file) {
            this.pushLog('on-success', `${file.name}`, res);
        },
        handleError(err, response, file) {
            this.items = this.items.filter(item => item.uid !== file.uid);
            const message = err && err.message ? err.message : 'unknown error';
            this.pushLog('on-error', `${file.name}`, { message, response });
        },
        handleRemove(file, fileList) {
            this.pushLog('on-remove', `${file.name} (remaining: ${fileList.length})`);
        },
        handlePreview(file) {
            this.pushLog('on-preview', `${file.name}`);
        },
        handleExceededSize(file) {
            this.pushLog('on-exceeded-size', `${file.name} size ${file.size}`);
        },
        handleFormatError(file) {
            this.pushLog('on-format-error', `${file.name}`);
        },
        pushLog(event, detail, payload) {
            const time = new Date().toLocaleTimeString();
            const logEntry = {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                time,
                event,
                detail,
                payload
            };
            this.logs.unshift(logEntry);
            if (this.logs.length > 30) {
                this.logs = this.logs.slice(0, 30);
            }
            /* eslint-disable no-console */
            if (payload !== undefined) {
                console.log(`[upload] ${event}: ${detail}`, payload);
            } else {
                console.log(`[upload] ${event}: ${detail}`);
            }
            /* eslint-enable no-console */
        }
    }
}
</script>
