<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="api" :rules="rules" label-position="right" label-width="165px">
      <el-form-item :label="$t('table.api.serviceId')" prop="serviceId">
        <treeselect v-model="api.serviceId" :multiple="false" :disable-branch-nodes="true" :show-count="true" :placeholder="$t('table.notice.userType')" :options="routes" :disabled="!api.apiId ? false : true" />
      </el-form-item>
      <el-form-item :label="$t('table.api.apiName')" prop="apiName">
        <el-input v-model="api.apiName" :readonly="!api.apiId ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.api.path')" prop="path">
        <el-input v-model="api.path" :readonly="!api.apiId ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.api.apiCode')" prop="apiCode">
        <el-input v-model="api.apiCode" :readonly="'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.api.apiCategory')" prop="apiCategory">
        <el-input v-model="api.apiCategory" :readonly="!api.apiId ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.api.priority')" prop="priority">
        <el-input-number v-model="api.priority" :min="0" />
      </el-form-item>
      <el-form-item :label="$t('table.api.isAuth')" prop="isAuth">
        <el-radio v-model="api.isAuth" :disabled="api.apiId && api.isPersist === 1?true:false" label="0">{{ $t('table.api.isAuth0') }}</el-radio>
        <el-radio v-model="api.isAuth" :disabled="api.apiId && api.isPersist === 1?true:false" label="1">{{ $t('table.api.isAuth1') }}</el-radio>
      </el-form-item>
      <el-form-item :label="$t('table.api.status')" prop="isOpen">
        <el-radio v-model="api.status" label="0">{{ $t('common.status.invalid') }}</el-radio>
        <el-radio v-model="api.status" label="1">{{ $t('common.status.valid') }}</el-radio>
      </el-form-item>
      <el-form-item :label="$t('table.api.apiDesc')" prop="apiDesc">
        <el-input v-model="api.apiDesc" type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" />
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
  name: 'ApiEdit',
  components: { Treeselect },
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
      api: this.initApi(),
      routes: [],
      rules: {
        serviceId: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        apiCategory: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        path: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        apiName: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
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
    this.initRoute()
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
    initRoute() {
      this.$get('system/api/treeServiceId').then((r) => {
        this.routes = r.data.data.rows
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    initApi() {
      return {
        apiId: null,
        serviceId: '',
        apiCategory: '',
        apiCode: '',
        apiName: '',
        path: '',
        priority: 0,
        isAuth: '0',
        isOpen: '0',
        isPersist: 0,
        status: '0',
        apiDesc: ''
      }
    },
    setApi(val) {
      // key遍历
      Object.keys(this.api).map(key => {
        if (key === 'status') {
          this.api.status = '' + val[key]
        } else if (key === 'isAuth') {
          this.api.isAuth = '' + val[key]
        } else if (key === 'isOpen') {
          this.api.isOpen = '' + val[key]
        } else {
          this.api[key] = val[key]
        }
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (this.type === 'add') {
            // create
            this.$post('system/api', { ...this.api }).then(() => {
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
            this.$put('system/api', { ...this.api }).then(() => {
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
      this.api = this.initApi()
      this.routes = this.initRoute()
    }
  }
}
</script>
