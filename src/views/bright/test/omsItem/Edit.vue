<template>
  <el-dialog
    :title="title"
    :width="width"
    top="100px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="omsItem" :rules="rules" label-position="right" label-width="129px">
      <el-form-item :label="$t('table.omsItem.itemName')" prop="itemName">
        <el-input v-model="omsItem.itemName"/>
      </el-form-item>
      <el-form-item :label="$t('table.omsItem.itemCode')" prop="itemCode">
        <el-input v-model="omsItem.itemCode" :readonly="!omsItem.id ? false : 'readonly'" placeholder=" " />
      </el-form-item>
      <el-form-item :label="$t('table.omsItem.itemStock')" prop="itemStock">
        <el-input-number v-model="omsItem.itemStock" :min="1"/>
      </el-form-item>
      <el-form-item :label="$t('table.omsItem.status')" prop="status">
        <el-switch
          v-model="omsItem.status"
          :active-text="$t('common.status.valid')"
          :inactive-text="$t('common.status.invalid')"
          active-value="1"
          inactive-value="0"
        />
      </el-form-item>
      <el-form-item :label="$t('table.omsItem.purchaseTime')" prop="purchaseTime">
        <el-date-picker
          v-model="omsItem.purchaseTime"
          type="datetime"
          :placeholder="$t('table.omsItem.purchaseTime')"
          value-format="yyyy-MM-dd"
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
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { isIntegerGreaterThanZero } from '@/utils/my-validate'

export default {
  name: 'OmsItemEdit',
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
      omsItem: this.initOmsItem(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        itemName: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        itemCode: [
          { required: true, message: this.$t('rules.require'), trigger: '[change, blur]' },
          { validator: (rule, value, callback) => {
              if (!this.omsItem.id && this.omsItem.itemName && this.omsItem.itemCode) {
                this.$get('test/omsItem/check', {
                  itemName: this.omsItem.itemName,
                  itemCode: this.omsItem.itemCode
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
        itemStock: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (!isIntegerGreaterThanZero(value)) {
                callback(new Error(this.$t('rules.invalidInteger')))
              } else {
                callback()
              }
            }, trigger: 'blur' }
        ],
        purchaseTime: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        status: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
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
  methods: {
    initOmsItem() {
      return {
        id: null,
        itemName: '',
        itemCode: '',
        itemStock: 0,
        purchaseTime: '',
        status: '1'
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
    setOmsItem(val) {
      this.omsItem = { ...val }
      delete this.omsItem.createTime
      delete this.omsItem.updateTime
    },
    close() {
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.omsItem.id) {
            // create
            this.$post('test/omsItem', { ...this.omsItem }).then(() => {
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
            this.$put('test/omsItem', { ...this.omsItem }).then(() => {
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
      this.omsItem = this.initOmsItem()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
