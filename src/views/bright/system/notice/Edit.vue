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
          <el-form-item :label="$t('table.notice.userType')" prop="userIds">
            <el-popover
              placement="bottom"
              width="400"
              trigger="click"
            >
              <el-table :data="gridData">
                <el-table-column width="150" property="date" label="日期" />
                <el-table-column width="100" property="name" label="姓名" />
                <el-table-column width="300" property="address" label="地址" />
              </el-table>
              <el-input slot="reference" v-model="notice.title" />
            </el-popover>
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
export default {
  name: 'NoticeEdit',
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
      props: { multiple: true },
      options: [{
        value: 1,
        label: '东南',
        children: [{
          value: 2,
          label: '上海',
          children: [
            { value: 3, label: '普陀' },
            { value: 4, label: '黄埔' },
            { value: 5, label: '徐汇' }
          ]
        }, {
          value: 7,
          label: '江苏',
          children: [
            { value: 8, label: '南京' },
            { value: 9, label: '苏州' },
            { value: 10, label: '无锡' }
          ]
        }, {
          value: 12,
          label: '浙江',
          children: [
            { value: 13, label: '杭州' },
            { value: 14, label: '宁波' },
            { value: 15, label: '嘉兴' }
          ]
        }]
      }, {
        value: 17,
        label: '西北',
        children: [{
          value: 18,
          label: '陕西',
          children: [
            { value: 19, label: '西安' },
            { value: 20, label: '延安' }
          ]
        }, {
          value: 21,
          label: '新疆维吾尔族自治区',
          children: [
            { value: 22, label: '乌鲁木齐' },
            { value: 23, label: '克拉玛依' }
          ]
        }]
      }],
      gridData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-03',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }]
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
        delFlag: '0'
      }
    },
    setNotice(val) {
      Object.keys(this.notice).map(key => {
        console.log('key', key)
        this.notice[key] = val[key]
      })
      console.log('notice', this.notice)
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
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
    }
  }
}
</script>
