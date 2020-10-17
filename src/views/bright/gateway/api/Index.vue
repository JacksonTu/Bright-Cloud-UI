<template>
  <div class="app-container">
    <el-alert
      style="margin: -1rem 0 1.2rem 0;padding: 1rem;"
      :title="$t('table.api.tips')"
      type="info"
      :closable="false"
    />
    <div class="filter-container">
      <el-input v-model="queryParams.path" :placeholder="$t('table.api.path')" class="filter-item search-item" />
      <el-input v-model="queryParams.apiName" :placeholder="$t('table.api.apiName')" class="filter-item search-item" />
      <el-input v-model="queryParams.serviceId" :placeholder="$t('table.api.serviceId')" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="success" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['api:add','api:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['api:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['api:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
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
      <el-table-column :label="$t('table.api.apiName')" prop="apiName" :show-overflow-tooltip="true" align="center" min-width="130px">
        <template slot-scope="scope">
          <span>{{ scope.row.apiName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.api.path')" prop="path" :show-overflow-tooltip="true" align="center" min-width="130px">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.api.apiCategory')" prop="apiCategory" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.apiCategory }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.api.serviceId')" prop="serviceId" :show-overflow-tooltip="true" align="center" min-width="130px">
        <template slot-scope="scope">
          <span>{{ scope.row.serviceId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.api.isAuth')" prop="isAuth" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isAuth ===1" size="small" type="success">{{ $t('table.api.isAuth1') }}</el-tag>
          <el-tag v-else-if="scope.row.isAuth !==1" size="small" type="danger">{{ $t('table.api.isAuth0') }}</el-tag>
          <el-tag v-if="scope.row.status ===1" size="small" type="success">{{ $t('common.status.valid') }}</el-tag>
          <el-tag v-else-if="scope.row.status ===0" size="small" type="danger">{{ $t('common.status.invalid') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.api.apiDesc')" prop="apiDesc" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.apiDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.api.updateTime')" prop="updateTime" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="100px" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <i v-hasPermission="['api:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i v-hasPermission="['api:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <el-link v-has-no-permission="['api:update','api:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <api-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      :type="dialog.type"
      @close="editClose"
      @success="editSuccess"
    />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import ApiEdit from './Edit'

export default {
  name: 'ApiManage',
  components: { Pagination, ApiEdit },
  filters: {
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: '',
        type: ''
      },
      tableKey: 0,
      loading: false,
      list: null,
      total: 0,
      queryParams: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      }
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    editSuccess() {
      this.search()
    },
    editClose() {
      this.dialog.isVisible = false
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    filterStatus(value, row) {
      return row.status === value
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
      this.dialog.type = 'add'
    },
    edit(row) {
      this.$refs.edit.setApi(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
      this.dialog.type = 'edit'
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
        const ids = []
        this.selection.forEach((c) => {
          ids.push(c.apiId)
        })
        this.delete(ids)
      }).catch(() => {
        this.clearSelections()
      })
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    delete(ids) {
      this.loading = true
      this.$delete(`system/api/${ids}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
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
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('system/api/list', {
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
<style lang="scss" scoped>
</style>
