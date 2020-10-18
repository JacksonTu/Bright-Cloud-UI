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
        <el-alert
          v-if="job.jobType ==='1'"
          title="远程定时任务使用Restful API接口，自动扫描各子项目中请求前缀为‘/task’的请求类型为‘GET’的请求."
          type="warning"
          :closable="false"
        />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='0'" :label="$t('table.job.beanName')" prop="beanName">
        <el-input v-model="job.beanName" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='0'" :label="$t('table.job.methodName')" prop="methodName">
        <el-input v-model="job.methodName" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.remotePath')" prop="apiId">
        <treeselect v-model="job.apiId" :multiple="false" :disable-branch-nodes="true" :show-count="true" :options="apis" @select="apiChange" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.serviceId')" prop="serviceId">
        <el-input v-model="job.serviceId" :disabled="true" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.path')" prop="path">
        <el-input v-model="job.path" :disabled="true" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.requestMethod')" prop="requestMethod">
        <el-input v-model="job.requestMethod" :disabled="true" />
      </el-form-item>
      <el-form-item v-if="job.jobType ==='1'" :label="$t('table.job.contentType')" prop="contentType">
        <el-input v-model="job.contentType" :disabled="true" />
      </el-form-item>
      <el-form-item :label="$t('table.job.params')" prop="params">
        <el-input v-model="job.params" />
        <el-alert
          v-if="job.jobType ==='1'"
          title="多个参数用逗号隔开，例: 远程请求：‘http://localhost:8000/task/test/{id}/{msg}’,请求参数：‘1,测试’."
          type="warning"
          :closable="false"
        />
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
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'JobEdit',
  components: { Treeselect },
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
      apis: [],
      queryParams: {},
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
    this.initApi()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
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
    initApi() {
      this.queryParams.prefix = '/task'
      this.$get('system/api/treeApi', {
        ...this.queryParams
      }).then((r) => {
        this.apis = r.data.data.rows
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    apiChange(node) {
      console.log('node', node)
      if (node.parentId === '0') {
        this.$message({
          message: this.$t('table.job.getApiDataFail'),
          type: 'error'
        })
      } else {
        this.job.serviceId = node.serviceId
        this.job.path = node.path
        this.job.requestMethod = node.requestMethod
        this.job.contentType = node.contentType === '' ? 'application/json' : node.contentType
      }
    },
    getApiId(job) {
      for (const item of this.apis) {
        if (item.hasChildren === true) {
          for (const item2 of item.children) {
            if (item2.serviceId === job.serviceId && item2.path === job.path && item2.requestMethod === job.requestMethod) {
              this.job.apiId = item2.id
            }
          }
        }
      }
    },
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
        alarmMail: '',
        apiId: null
      }
    },
    setJob(val) {
      this.job = { ...val }
      if (this.job.jobType === '1') {
        this.getApiId(this.job)
      }
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
      this.apis = this.initApi()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
