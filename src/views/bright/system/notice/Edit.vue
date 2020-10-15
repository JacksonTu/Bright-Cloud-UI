<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="notice" :rules="rules" label-position="right" label-width="165px">
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.title')" prop="title">
            <el-input v-model="notice.title" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.msgCategory')" prop="msgCategory">
            <el-select v-model="notice.msgCategory" placeholder="" value="" style="width:100%">
              <el-option :label="$t('table.notice.msgCategory1')" value="1" />
              <el-option :label="$t('table.notice.msgCategory2')" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.startTime')" prop="startTime">
            <el-date-picker
              v-model="notice.startTime"
              type="datetime"
              :placeholder="$t('table.notice.startTime')"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.endTime')" prop="endTime">
            <el-date-picker
              v-model="notice.endTime"
              type="datetime"
              :placeholder="$t('table.notice.endTime')"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.priority')" prop="priority">
            <el-select v-model="notice.priority" placeholder="" value="" style="width:100%">
              <el-option :label="$t('table.notice.priorityH')" value="H" />
              <el-option :label="$t('table.notice.priorityM')" value="M" />
              <el-option :label="$t('table.notice.priorityL')" value="L" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.msgType')" prop="msgType">
            <el-select v-model="notice.msgType" placeholder="" value="" style="width:100%">
              <el-option :label="$t('table.notice.msgTypeAll')" value="ALL" />
              <el-option :label="$t('table.notice.msgTypeUser')" value="USER" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item :label="$t('table.notice.msgAbstract')" prop="msgAbstract">
            <el-input v-model="notice.msgAbstract" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item v-if="notice.msgType === 'USER' " :label="$t('table.notice.userType')" prop="userIds">
            <treeselect v-model="notice.userIdArray" :multiple="true" :disable-branch-nodes="true" :show-count="true" :placeholder="$t('table.notice.userType')" :options="users" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item :label="$t('table.notice.msgContent')" prop="msgContent">
            <Tinymce ref="editor" v-model="notice.msgContent" :height="400" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import Tinymce from '@/components/Tinymce'
export default {
  name: 'NoticeEdit',
  components: { Treeselect, Tinymce },
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
      notice: this.initNotice(),
      rules: {
        title: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 3, max: 20, message: this.$t('rules.range3to20'), trigger: 'blur' }
        ],
        msgCategory: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        priority: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        msgType: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        msgAbstract: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 3, max: 200, message: this.$t('rules.range3to20'), trigger: 'blur' }
        ],
        startTime: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        endTime: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ]
      },
      users: []
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
    this.initUser()
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
        userIdArray: []
      }
    },
    initUser() {
      this.$get('system/user/treeUser').then((r) => {
        this.users = r.data.data.rows
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    setNotice(val) {
      // key遍历
      Object.keys(this.notice).map(key => {
        this.notice[key] = val[key]
      })
      // 字符串转数组
      if (this.notice.userIds) {
        this.notice.userIdArray = this.notice.userIds.split(',')
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.notice.msgType === 'USER' && !this.notice.userIdArray) {
            this.$message({
              message: '指定用户不能为空',
              type: 'warning'
            })
            return
          }
          // 数组转字符串
          if (this.notice.userIdArray) {
            this.notice.userIds = this.notice.userIdArray.join(',')
          }
          this.buttonLoading = true
          if (this.type === 'add') {
            // create
            this.$post('msg/notice', { ...this.notice }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          } else {
            // update
            this.$put('msg/notice', { ...this.notice }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          }
        } else {
          return false
        }
      })
    },
    close() {
      this.$emit('close')
    },
    reset() {
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.notice = this.initNotice()
      this.users = this.initUser()
    }
  }
}
</script>
