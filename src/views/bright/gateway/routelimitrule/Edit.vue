<template>
  <el-dialog
    :title="title"
    :width="width"
    top="100px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="rateLimitRule" :rules="rules" label-position="right" label-width="129px">
      <el-form-item :label="$t('table.rateLimitRule.requestUri')" prop="requestUri">
        <el-input v-if="!rateLimitRule.id ? false:true" v-model="rateLimitRule.requestUri" :readonly="!rateLimitRule.id ? false : 'readonly'" />
        <treeselect
          v-if="rateLimitRule.id === null"
          v-model="rateLimitRule.apiId"
          :disable-branch-nodes="true"
          :multiple="false"
          :options="apis"
          :show-count="true"
          @select="apiChange"
        />
      </el-form-item>
      <el-form-item v-if="rateLimitRule.paramFlag == 1" :label="$t('table.rateLimitRule.params')" prop="requestUri">
        <el-input v-model="rateLimitRule.params" :readonly="!rateLimitRule.id ? false : 'readonly'" />
        <el-alert
          :title="$t('table.rateLimitRule.alert')"
          type="warning"
          :closable="false"
        />
      </el-form-item>
      <el-form-item v-if="!rateLimitRule.id ? false : true" :label="$t('table.rateLimitRule.requestMethod')" prop="requestMethod">
        <el-select
          v-model="rateLimitRule.requestMethod"
          :disabled="!rateLimitRule.id ? false : 'disabled'"
          placeholder=""
          style="width:100%"
          value=""
        >
          <el-option
            v-for="item in requestMethods"
            :key="item.id"
            :label="item.name"
            :value="String(item.name)"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.rateLimitRule.count')" prop="count">
        <el-input v-model="rateLimitRule.count" />
      </el-form-item>
      <el-form-item :label="$t('table.rateLimitRule.period')" prop="intervalSec">
        <el-input v-model="rateLimitRule.intervalSec" />
      </el-form-item>
      <el-form-item :label="$t('table.rateLimitRule.status')" prop="status">
        <el-switch
          v-model="rateLimitRule.status"
          :active-text="$t('common.status.valid')"
          :inactive-text="$t('common.status.invalid')"
          active-value="1"
          inactive-value="0"
        />
      </el-form-item>
      <el-form-item :label="$t('table.rateLimitRule.timeLimit')">
        <el-switch
          v-model="rateLimitRule.timeLimit"
          :active-text="$t('common.open')"
          :inactive-text="$t('common.close')"
          active-value="1"
          inactive-value="0"
        />
      </el-form-item>
      <el-form-item v-if="rateLimitRule.timeLimit === '1'" :label="$t('table.rateLimitRule.timeRange')" prop="limitTime">
        <el-date-picker
          v-model="rateLimitRule.limitFrom"
          type="datetime"
          :placeholder="$t('table.rateLimitRule.limitFrom')"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <el-date-picker
          v-model="rateLimitRule.limitTo"
          type="datetime"
          :placeholder="$t('table.rateLimitRule.limitTo')"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
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
import { isIntegerGreaterThanZero } from '@/utils/my-validate'

export default {
  name: 'RateLimitRuleEdit',
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
      rateLimitRule: this.initRouteLimitRule(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      requestMethods: [
        { id: 1, name: 'GET' },
        { id: 2, name: 'POST' },
        { id: 3, name: 'PUT' },
        { id: 4, name: 'DELETE' },
        { id: 5, name: 'ALL' }
      ],
      apis: [],
      queryParams: {},
      rules: {
        requestUri: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        requestMethod: [
          { required: true, message: this.$t('rules.require'), trigger: '[change, blur]' },
          {
            validator: (rule, value, callback) => {
              if (!this.rateLimitRule.id && this.rateLimitRule.requestMethod && this.rateLimitRule.requestUri) {
                this.$get('system/gatewayRouteLimitRule/check', {
                  requestUri: this.rateLimitRule.requestUri,
                  requestMethod: this.rateLimitRule.requestMethod
                }).then((r) => {
                  if (!r.data) {
                    callback(this.$t('tips.sameRule'))
                  } else {
                    callback()
                  }
                })
              } else {
                callback()
              }
            }, trigger: 'change' }
        ],
        count: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!isIntegerGreaterThanZero(value)) {
              callback(new Error(this.$t('rules.invalidInteger')))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        intervalSec: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!isIntegerGreaterThanZero(value)) {
              callback(new Error(this.$t('rules.invalidInteger')))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        limitTime: { validator: (rule, value, callback) => {
          if (this.rateLimitRule.timeLimit === '1' && (!this.rateLimitRule.limitFrom || !this.rateLimitRule.limitTo)) {
            callback(new Error(this.$t('rules.require')))
          } else {
            callback()
          }
        }, trigger: 'blur' }
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
    initRouteLimitRule() {
      return {
        id: null,
        requestUri: '',
        requestMethod: '',
        limitFrom: '',
        limitTo: '',
        count: '',
        intervalSec: '',
        timeLimit: '0',
        status: '1',
        apiId: null,
        params: '',
        paramFlag: 0
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
    initApi() {
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
        this.rateLimitRule.requestUri = node.path
        this.rateLimitRule.requestMethod = node.requestMethod
        if (this.rateLimitRule.requestUri.indexOf('{') !== -1 && this.rateLimitRule.requestUri.indexOf('}') !== -1) {
          this.rateLimitRule.paramFlag = 1
        }
      }
    },
    // 通配符替换
    paramReplace() {
      if (this.rateLimitRule.paramFlag === 1) {
        if (this.rateLimitRule.params.indexOf('{') !== -1 && this.rateLimitRule.params.indexOf('}') !== -1) {
          this.$message({
            message: this.$t('table.rateLimitRule.nst'),
            type: 'error'
          })
          return false
        } else {
          this.rateLimitRule.requestUri = this.rateLimitRule.params
          return true
        }
      }
      return true
    },
    setRouteLimitRule(val) {
      this.rateLimitRule = { ...val }
    },
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.rateLimitRule.id) {
            if (this.paramReplace()) {
              // create
              this.$post('system/gatewayRouteLimitRule', { ...this.rateLimitRule }).then(() => {
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
            }
          } else {
            // update
            this.$put('system/gatewayRouteLimitRule', { ...this.rateLimitRule }).then(() => {
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
      this.rateLimitRule = this.initRouteLimitRule()
      this.apis = this.initApi()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
