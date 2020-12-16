<template>
  <div class="app-container">
    <el-alert
      style="margin: -1rem 0 1.2rem 0;padding: 1rem;"
      :title="$t('table.rateLimitLog.tips')"
      type="info"
      :closable="false"
    />
    <div class="filter-container">
      <el-input v-model="queryParams.ip" :placeholder="$t('table.rateLimitLog.ip')" class="filter-item search-item" />
      <el-input v-model="queryParams.requestUri" :placeholder="$t('table.rateLimitLog.requestUri')" class="filter-item search-item" />
      <el-input v-model="queryParams.requestMethod" :placeholder="$t('table.rateLimitLog.requestMethod')" class="filter-item search-item" />
      <el-select
        v-model="queryParams.requestMethod"
        filterable
        clearable
        :placeholder="$t('table.rateLimitLog.requestMethod')"
        value=""
        class="filter-item search-item">
        <el-option
          v-for="item in requestMethods"
          :key="item.id"
          :label="item.name"
          :value="String(item.name)"
        />
      </el-select>
      <el-date-picker
        v-model="queryParams.timeRange"
        :range-separator="null"
        :start-placeholder="$t('table.rateLimitLog.createTime')"
        value-format="yyyy-MM-dd"
        class="filter-item search-item date-range-item"
        type="daterange"
      />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="success" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['gatewayRouteLimitRuleLog:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['gatewayRouteLimitRuleLog:delete']"  @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
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
      <el-table-column :label="$t('table.rateLimitLog.ip')" prop="ip" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.rateLimitLog.requestUri')" prop="requestUri" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.requestUri }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.rateLimitLog.requestMethod')" prop="requestMethod" :show-overflow-tooltip="true" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.requestMethod | requestMethodFilter">
            {{ row.requestMethod }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.rateLimitLog.location')" prop="location" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.location }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.rateLimitLog.createTime')" prop="createTime" :show-overflow-tooltip="true" align="center" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="60px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-has-permission="['gatewayRouteLimitRuleLog:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'RouteLimitLog',
  components: { Pagination },
  filters: {
    requestMethodFilter(v) {
      if (v === 'GET') {
        return 'success'
      } else if (v === 'POST') {
        return ''
      } else if (v === 'DELETE') {
        return 'danger'
      } else if (v === 'PUT') {
        return 'warning'
      } else {
        return 'info'
      }
    },
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
      list: null,
      total: 0,
      queryParams: {},
      sort: {},
      selection: [],
      pagination: {
        size: 10,
        num: 1
      },
      requestMethods: [
        { id: 1, name: 'GET' },
        { id: 2, name: 'POST' },
        { id: 3, name: 'PUT' },
        { id: 4, name: 'DELETE' },
        { id: 5, name: 'ALL' }
      ]
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    filterStatus(value, row) {
      return row.status === value
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
        const rateLimitLogs = []
        this.selection.forEach((c) => {
          rateLimitLogs.push(c.id)
        })
        this.delete(rateLimitLogs)
      }).catch(() => {
        this.clearSelections()
      })
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    delete(rateLimitLogs) {
      this.loading = true
      this.$delete(`system/gatewayRouteLimitRuleLog/${rateLimitLogs}`).then(() => {
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
      this.$get('system/gatewayRouteLimitRuleLog/list', {
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
