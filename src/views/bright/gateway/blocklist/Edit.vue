<template>
  <el-dialog
    :title="title"
    :width="width"
    top="100px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="blockList" :rules="rules" label-position="right" label-width="129px">
      <el-form-item :label="$t('table.blockList.ip')" prop="ip">
        <el-input v-model="blockList.ip" :readonly="!blockList.id ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.blockList.requestUri')" prop="requestUri">
        <el-input v-if="!blockList.id ? false : true" v-model="blockList.requestUri" :readonly="!blockList.id ? false : 'readonly'" :placeholder="$t('table.blockList.st')" />
        <treeselect v-if="!blockList.id ? true : false" v-model="blockList.apiId" :multiple="false" :disable-branch-nodes="true" :show-count="true" :options="apis" @select="apiChange" />
      </el-form-item>
      <el-form-item v-if="!blockList.id ? false : true" :label="$t('table.blockList.requestMethod')" prop="requestMethod">
        <el-select v-model="blockList.requestMethod" :disabled="!blockList.id ? false : 'disabled'" value="" placeholder="" style="width:100%">
          <el-option
            v-for="item in requestMethods"
            :key="item.id"
            :label="item.name"
            :value="String(item.name)"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.blockList.status')" prop="status">
        <el-switch
          v-model="blockList.status"
          :active-text="$t('common.status.valid')"
          :inactive-text="$t('common.status.invalid')"
          active-value="1"
          inactive-value="0"
        />
      </el-form-item>
      <el-form-item :label="$t('table.blockList.timeLimit')">
        <el-switch
          v-model="blockList.timeLimit"
          :active-text="$t('common.open')"
          :inactive-text="$t('common.close')"
          active-value="1"
          inactive-value="0"
        />
      </el-form-item>
      <el-form-item v-if="blockList.timeLimit === '1'" :label="$t('table.blockList.timeRange')" prop="limitTime">
        <el-date-picker
          v-model="blockList.limitFrom"
          type="datetime"
          :placeholder="$t('table.blockList.limitFrom')"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
        <el-date-picker
          v-model="blockList.limitTo"
          type="datetime"
          :placeholder="$t('table.blockList.limitTo')"
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

export default {
  name: 'BlockListEdit',
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
      blockList: this.initBlockList(),
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
          { validator: (rule, value, callback) => {
              if (!this.blockList.id && this.blockList.requestMethod && this.blockList.requestUri) {
                this.$get('system/gatewayBlockList/check', {
                  ip: this.blockList.ip,
                  requestUri: this.blockList.requestUri,
                  requestMethod: this.blockList.requestMethod
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
        limitTime: { validator: (rule, value, callback) => {
            if (this.blockList.timeLimit === '1' && (!this.blockList.limitFrom || !this.blockList.limitTo)) {
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
    initBlockList() {
      return {
        id: null,
        ip: '',
        requestUri: '',
        requestMethod: '',
        limitFrom: '',
        limitTo: '',
        timeLimit: '0',
        status: '1',
        apiId: null
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
        this.blockList.requestUri = node.path
        this.blockList.requestMethod = node.requestMethod
      }
    },
    setBlockList(val) {
      this.blockList = { ...val }
      delete this.blockList.createTime
      delete this.blockList.updateTime
    },
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.blockList.id) {
            // create
            this.$post('system/gatewayBlockList', { ...this.blockList }).then(() => {
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
            this.$put('system/gatewayBlockList', { ...this.blockList }).then(() => {
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
      this.blockList = this.initBlockList()
      this.apis = this.initApi()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
