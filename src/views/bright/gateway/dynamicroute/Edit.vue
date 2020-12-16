<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="dynamicRoute" :rules="rules" label-position="right" label-width="165px">
      <el-form-item :label="$t('table.dynamicRoute.routeName')" prop="routeName">
        <el-input v-model="dynamicRoute.routeName" :readonly="type === 'add' ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.dynamicRoute.routeId')" prop="routeId">
        <el-input v-model="dynamicRoute.routeId" :readonly="type === 'add' ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.dynamicRoute.routeUri')" prop="routeUri">
        <el-input v-model="dynamicRoute.routeUri" :readonly="type === 'add' ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.dynamicRoute.routeOrder')" prop="routeOrder">
        <el-input v-model="dynamicRoute.routeOrder" />
      </el-form-item>
      <el-form-item :label="$t('table.dynamicRoute.predicates')" prop="predicates">
        <el-input v-model="dynamicRoute.predicates" type="textarea" autosize placeholder="请输入内容"/>
      </el-form-item>
      <el-form-item :label="$t('table.dynamicRoute.filters')" prop="filters">
        <el-input v-model="dynamicRoute.filters" type="textarea" autosize placeholder="请输入内容"/>
      </el-form-item>
      <el-form-item :label="$t('table.dynamicRoute.enable')" prop="enable">
        <el-select v-model="dynamicRoute.enable" placeholder="" value="" style="width:100%">
          <el-option :label="$t('table.status.valid')" value="1" />
          <el-option :label="$t('table.status.invalid')" value="0" />
        </el-select>
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

import { isIntegerGreaterThanZero } from '@/utils/my-validate'

export default {
  name: 'DynamicRouteEdit',
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
      dynamicRoute: this.initDynamicRoute(),
      rules: {
        routeId: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (this.type === 'add') {
                this.$get(`system/gatewayDynamicRoute/check/${value}`).then((r) => {
                  if (!r.data) {
                    callback(this.$t('rules.routeIdExist'))
                  } else {
                    callback()
                  }
                })
              } else {
                callback()
              }
            }, trigger: 'blur' }
        ],
        routeName: [
          { max: 100, message: this.$t('rules.noMoreThan100'), trigger: 'blur' },
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        routeUri: [
          { max: 100, message: this.$t('rules.noMoreThan100'), trigger: 'blur' },
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        routeOrder: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        predicates: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        filters: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ],
        enable: [
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
        return '800px'
      }
    },
    initDynamicRoute() {
      return {
        routeName: '',
        routeId: '',
        routeUri: '',
        routeOrder: 0,
        predicates: '',
        filters: '',
        enable: '1'
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (this.type === 'add') {
            // create
            this.$post('system/gatewayDynamicRoute', { ...this.dynamicRoute }).then(() => {
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
            this.$put('system/gatewayDynamicRoute', { ...this.dynamicRoute }).then(() => {
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
    setDynamicRoute(val) {
      this.dynamicRoute = { ...val }
      this.dynamicRoute.enable = this.dynamicRoute.enable.toString()
      delete this.dynamicRoute.createTime
      delete this.dynamicRoute.updateTime
    },
    close() {
      this.$emit('close')
    },
    reset() {
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.dynamicRoute = this.initDynamicRoute()
    }
  }
}
</script>
