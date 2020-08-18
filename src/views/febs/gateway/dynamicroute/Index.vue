<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryParams.routeName" :placeholder="$t('table.dynamicRoute.routeName')" class="filter-item search-item" />
      <el-input v-model="queryParams.routeId" :placeholder="$t('table.dynamicRoute.routeId')" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="success" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['gatewayDynamicRoute:add','gatewayDynamicRoute:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['gatewayDynamicRoute:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['gatewayDynamicRoute:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
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
      <el-table-column :label="$t('table.dynamicRoute.routeName')" prop="routeName" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.routeName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.routeId')" prop="routeId" :show-overflow-tooltip="true" align="center" min-width="100px">
        <template slot-scope="scope">
          <span>{{ scope.row.routeId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.routeUri')" prop="routeUri" :show-overflow-tooltip="true" align="center" min-width="170px">
        <template slot-scope="scope">
          <span>{{ scope.row.routeUri }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.routeOrder')" prop="routeOrder" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.routeOrder }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.predicates')" prop="predicates" :show-overflow-tooltip="true" align="center" min-width="160px">
        <template slot-scope="scope">
          <span>{{ scope.row.predicates }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.filters')" prop="filters" :show-overflow-tooltip="true" align="center" min-width="160px">
        <template slot-scope="scope">
          <span>{{ scope.row.filters }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.dynamicRoute.enable')"
        :filters="[{ text: $t('common.status.valid'), value: '1' }, { text: $t('common.status.invalid'), value: '0' }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.enable | statusFilter">
            {{ row.enable === 1 ? $t('common.status.valid') : $t('common.status.invalid') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.createTime')" prop="createTime" :show-overflow-tooltip="true" align="center" min-width="140px">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.dynamicRoute.updateTime')" prop="updateTime" :show-overflow-tooltip="true" align="center" min-width="140px">
        <template slot-scope="scope">
          <span>{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <i v-hasPermission="['gatewayDynamicRoute:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i v-hasPermission="['gatewayDynamicRoute:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <el-link v-has-no-permission="['client:decrypt','gatewayDynamicRoute:update','gatewayDynamicRoute:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <dynamic-route-edit
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
import DynamicRouteEdit from './Edit'

export default {
  name: 'DynamicRoute',
  components: { Pagination, DynamicRouteEdit },
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
      this.$refs.edit.setDynamicRoute(row)
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
        const clientIds = []
        this.selection.forEach((c) => {
          clientIds.push(c.id)
        })
        this.delete(clientIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    delete(clientIds) {
      this.loading = true
      this.$delete(`system/gatewayDynamicRoute`, { clientIds }).then(() => {
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
      this.$get('system/gatewayDynamicRoute/list', {
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
