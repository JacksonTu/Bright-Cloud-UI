<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    append-to-body
  >
    <el-row>
      <el-col :span="24">
        <div style="text-align: center">
          <h3>{{ notice.title }}</h3>
          <p style="color: rgba(0,0,0,.45);margin-bottom: 0px">发布人：{{ notice.createUser }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;发布时间：{{ notice.sendTime }}</p>
        </div>
      </el-col>
    </el-row>
    <el-divider />
    <el-row>
      <el-col :span="24">
        <div style="text-align: center">
          <p>{{ notice.msgAbstract }}</p>
        </div>
      </el-col>
    </el-row>
    <el-divider />
    <el-row>
      <el-col :span="24">
        <p v-html="notice.msgContent" />
      </el-col>
    </el-row>
    <el-divider />
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
    </div>
  </el-dialog>

</template>

<script>

export default {
  name: 'ShowNotice',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      screenWidth: 0,
      buttonLoading: false,
      width: this.initWidth(),
      notice: this.initNotice()
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
        this.reset()
      }
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  activated() {
  },
  methods: {
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 991) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '45%'
      } else {
        return '800px'
      }
    },
    initNotice() {
      return {
        id: null,
        title: '',
        msgCategory: '',
        priority: '',
        msgType: '',
        msgAbstract: '',
        startTime: '',
        endTime: '',
        msgContent: '',
        sendStatus: '0',
        userIds: '',
        delFlag: '0',
        sendTime: '',
        createUser: ''
      }
    },
    setNotice(val) {
      // key遍历
      Object.keys(this.notice).map(key => {
        this.notice[key] = val[key]
      })
    },
    close() {
      this.$emit('close')
    },
    reset() {
      this.notice = this.initNotice()
    }
  }
}
</script>

<style scoped>

</style>
