<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="jobType" placeholder="" value="" class="filter-item search-item">
        <el-option label="远程服务" value="1" />
        <el-option label="本地方法" value="0" />
      </el-select>
      <el-input v-if="jobType==='0'" v-model="queryParams.beanName" :placeholder="$t('table.job.beanName')" class="filter-item search-item" />
      <el-input v-if="jobType==='0'" v-model="queryParams.methodName" :placeholder="$t('table.job.methodName')" class="filter-item search-item" />
      <el-input v-if="jobType==='1'" v-model="queryParams.serviceId" :placeholder="$t('table.job.serviceId')" class="filter-item search-item" />
      <el-input v-if="jobType==='1'" v-model="queryParams.path" :placeholder="$t('table.job.path')" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="success" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['job:log:delete','job:log:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['job:log:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['job:log:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
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
      @selection-change="onSelectChange"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column
        :label="$t('table.job.jobType')"
        prop="jobType"
        :show-overflow-tooltip="true"
        :filters="[{ text: $t('table.job.remote'), value: '1' }, { text: $t('table.job.local'), value: '0' }]"
        :filter-method="filterStatus"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.jobType | statusFilter">
            {{ row.jobType === '1' ? $t('table.job.remote'): $t('table.job.local') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.beanName')" prop="beanName" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.beanName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.methodName')" prop="methodName" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.methodName }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.serviceId')" prop="serviceId" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.serviceId }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.path')" prop="path" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.requestMethod')" prop="requestMethod" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.requestMethod }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.contentType')" prop="contentType" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.contentType }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.params')" prop="params" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.params }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.alarmMail')" prop="alarmMail" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.alarmMail }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.error')" prop="error" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.error }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.job.status')"
        prop="status"
        :show-overflow-tooltip="true"
        :filters="[{ text: $t('table.job.fail'), value: '1' }, { text: $t('table.job.success'), value: '0' }]"
        :filter-method="filterStatus"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === '1' ? $t('table.job.fail'): $t('table.job.success') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.time')" prop="times" :show-overflow-tooltip="true" align="center" min-width="110px" sortable="custom">
        <template slot-scope="{row}">
          <el-tag :type="row.times | timeFilter">
            {{ transTime(row.times) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.job.executeTime')" prop="createTime" :show-overflow-tooltip="true" align="center" min-width="150px" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="110px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-has-permission="['job:log:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <el-link v-has-no-permission="['job:log:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'

export default {
  name: 'JobLog',
  components: { Pagination },
  filters: {
    timeFilter(time) {
      if (time < 500) {
        return 'success'
      } else if (time < 1000) {
        return ''
      } else if (time < 1500) {
        return 'warning'
      } else {
        return 'danger'
      }
    },
    statusFilter(status) {
      const map = {
        0: 'success',
        1: 'danger'
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
      jobType: '0'
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    filterStatus(value, row) {
      return row.status === value
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    exportExcel() {
      this.$download('job/log/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `jobLog_${new Date().getTime()}.xlsx`)
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.createTimeFrom = this.queryParams.timeRange[0]
        params.createTimeTo = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('job/log', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
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
        const logIds = []
        this.selection.forEach((l) => {
          logIds.push(l.logId)
        })
        this.delete(logIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(logIds) {
      this.loading = true
      this.$delete(`job/log/${logIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    transTime(time) {
      return `${time} ms`
    },
    sortChange(val, a) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}

</script>
