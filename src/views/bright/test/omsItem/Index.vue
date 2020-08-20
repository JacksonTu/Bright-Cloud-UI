<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryParams.itemName" :placeholder="$t('table.omsItem.itemName')" class="filter-item search-item" />
      <el-input v-model="queryParams.itemCode" :placeholder="$t('table.omsItem.itemCode')" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="success" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-upload
        v-has-permission="['omsItem:import']"
        class="upload filter-item"
        :action="uploadAction"
        :headers="headers"
        list-type="picture"
        :show-file-list="false"
        :before-upload="beforeUpload"
        :on-success="uploadSuccess"
        :on-error="uploadError"
        :on-progress="uploadProgress"
      >
        <el-button class="filter-item" icon="el-icon-upload" type="success" plain>{{ $t('table.import') }}</el-button>
      </el-upload>
      <el-dropdown v-has-any-permission="['omsItem:add','omsItem:delete','omsItem:export','omsItem:template']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['omsItem:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['omsItem:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['omsItem:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['omsItem:template']" @click.native="templateDownload">{{ $t('table.templateDownload') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table
      ref="table"
      :key="tableKey"
      v-loading="loading"
      :data="list"
      border
      fit
      style="width: 100%;"
      :highlight-current-row="true"
      @selection-change="onSelectChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column :label="$t('table.omsItem.itemName')" prop="itemName" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.itemName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.omsItem.itemCode')" prop="itemCode" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.itemCode }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.omsItem.itemStock')" prop="itemStock" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.itemStock }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.omsItem.purchaseTime')" prop="purchaseTime" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.purchaseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.omsItem.status')"
        :filters="[{ text: $t('common.status.valid'), value: '1' }, { text: $t('common.status.invalid'), value: '0' }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === '1' ? $t('common.status.valid') : $t('common.status.invalid') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.omsItem.createTime')" prop="createTime" :show-overflow-tooltip="true" align="center" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.omsItem.updateTime')" prop="createTime" :show-overflow-tooltip="true" align="center" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="60px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-has-permission="['omsItem:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i v-has-permission="['omsItem:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <OmsItemEdit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <result
      :dialog-visible="dialogVisible"
      :data="data"
      :error="error"
      :time="time"
      @close="closeDialog"
    />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import OmsItemEdit from './Edit'
import Result from './Result'
import { getFileType } from '@/utils'
import { getToken } from '@/utils/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  name: 'OmsItem',
  components: { Pagination, OmsItemEdit,Result },
  filters: {
    statusFilter(status) {
      const map = {
        0: 'danger',
        1: 'success'
      }
      return map[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      loading: false,
      dialog: {
        isVisible: false,
        title: ''
      },
      list: null,
      total: 0,
      queryParams: {},
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      },
      fileList: [],
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      data: [],
      error: [],
      time: '0 ms',
      uploadAction: `${process.env.VUE_APP_BASE_API}test/omsItem/import`,
      dialogVisible: false
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    filterStatus(value, row) {
      return row.status === value
    },
    templateDownload() {
      this.$download('test/omsItem/template', {}, 'omsItem_import_template.xlsx')
    },
    exportExcel() {
      this.$download('test/omsItem/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `omsItem_${new Date().getTime()}.xlsx`)
    },
    beforeUpload(file) {
      const type = getFileType(file.name)
      if (type !== 'xlsx') {
        this.$message({
          message: this.$t('tips.onlySupportXlsx'),
          type: 'error'
        })
        return false
      } else {
        return true
      }
    },
    uploadError() {
      this.$message({
        message: this.$t('tips.uploadFailed'),
        type: 'error'
      })
      NProgress.done()
    },
    uploadSuccess(response) {
      const data = response.data
      this.data = data.data
      this.error = data.error
      this.time = data.time
      NProgress.done()
      this.fetch()
      this.dialogVisible = true
    },
    uploadProgress() {
      NProgress.start()
    },
    closeDialog() {
      this.dialogVisible = false
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    edit(row) {
      if (row.limitFrom && row.limitTo) {
        row.timeLimit = '1'
      }
      this.$refs.edit.setOmsItem(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const omsItemIds = []
        this.selection.forEach((c) => {
          omsItemIds.push(c.id)
        })
        this.delete(omsItemIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    delete(omsItemIds) {
      this.loading = true
      console.log(omsItemIds)
      this.$delete(`test/omsItem/${omsItemIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    search() {
      this.fetch({
        ...this.queryParams
      })
    },
    reset() {
      this.queryParams = {}
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('test/omsItem/list', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    }
  }
}
</script>
