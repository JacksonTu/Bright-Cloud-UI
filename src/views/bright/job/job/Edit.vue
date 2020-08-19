<template>
  <el-dialog
    :title="title"
    :width="width"
    top="100px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="job" :rules="rules" label-position="right" label-width="129px">
      <el-form-item :label="$t('table.job.jobType')" prop="jobType">
        <el-select v-model="job.jobType" placeholder="" value="" style="width:100%">
          <el-option label="远程服务" value="1" />
          <el-option label="本地方法" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="job.jobType ==='0'" :label="$t('table.job.beanName')" prop="beanName">
        <el-input v-model="job.beanName" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='0'" :label="$t('table.job.methodName')" prop="methodName">
        <el-input v-model="job.methodName" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.serviceId')" prop="serviceId">
        <el-input v-model="job.serviceId" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.path')" prop="path">
        <el-input v-model="job.path" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.requestMethod')" prop="requestMethod">
        <el-input v-model="job.requestMethod" />
      </el-form-item>
      <el-form-item  v-if="job.jobType ==='1'" :label="$t('table.job.contentType')" prop="contentType">
        <el-input v-model="job.contentType" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='0'" :label="$t('table.job.params')" prop="params">
        <el-input v-model="job.params" />
      </el-form-item>
      <el-form-item :label="$t('table.job.alarmMail')" prop="alarmMail">
        <el-input v-model="job.alarmMail" />
      </el-form-item>
      <el-form-item :label="$t('table.job.cronExpression')" prop="cronExpression">
        <el-input v-model="job.cronExpression" />
      </el-form-item>
      <el-form-item :label="$t('table.job.remark')" prop="remark">
        <el-input v-model="job.remark" />
      </el-form-item>
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
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'JobEdit',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      job: this.initJob(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        beanName: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        methodName: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        jobType: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        serviceId: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        path: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        requestMethod: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        contentType: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        alarmMail: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        cronExpression: [
          { required: true, message: this.$t('rules.require'), trigger: '[ blur]' },
          { validator: (rule, value, callback) => {
            this.$get('job/cron/check', {
              cron: value
            }).then((r) => {
              if (!r.data) {
                callback(this.$t('tips.cronInvalid'))
              } else {
                callback()
              }
            })
          }, trigger: 'change' }
        ]
      }
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
  methods: {
    initJob() {
      return {
        jobId: null,
        beanName: '',
        methodName: '',
        params: '',
        cronExpression: '',
        remark: '',
        jobType: '0',
        serviceId: '',
        path: '',
        requestMethod: '',
        contentType: '',
        alarmMail: ''
      }
    },
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 991) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '45%'
      } else {
        return '700px'
      }
    },
    setJob(val) {
      this.job = { ...val }
    },
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.job.jobId) {
            // create
            this.$post('job', { ...this.job }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
            }).catch(r => {
              this.buttonLoading = false
            })
          } else {
            // update
            this.job.createTime = null
            this.$put('job', { ...this.job }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            }).catch(r => {
              this.buttonLoading = false
            })
          }
        } else {
          return false
        }
      })
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.job = this.initJob()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
