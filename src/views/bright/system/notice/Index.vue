<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryParams.title" :placeholder="$t('table.notice.title')" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="success" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['notice:add','notice:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['notice:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['notice:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
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
      <el-table-column :label="$t('table.notice.title')" prop="title" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.notice.msgCategory')"
        :filters="[{ text: $t('table.notice.msgCategory1'), value: '1' }, { text: $t('table.notice.msgCategory2'), value: '2' }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.msgCategory | msgCategoryFilter">
            {{ row.msgCategory === '1' ? $t('table.notice.msgCategory1') : $t('table.notice.msgCategory2') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.notice.createUser')" prop="createUser" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createUser }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.notice.priority')" prop="priority" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.priority ==='H'" size="small" type="success">{{ $t('table.notice.priorityH') }}</el-tag>
          <el-tag v-else-if="scope.row.priority ==='M'" size="small" type="primary">{{ $t('table.notice.priorityM') }}</el-tag>
          <el-tag v-else-if="scope.row.priority ==='L'" size="small" type="info">{{ $t('table.notice.priorityL') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.notice.msgType')" prop="msgType" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.msgType ==='ALL'" size="small" type="success">{{ $t('table.notice.msgTypeAll') }}</el-tag>
          <el-tag v-else-if="scope.row.msgType ==='USER'" size="small" type="primary">{{ $t('table.notice.msgTypeUser') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.notice.sendStatus')" prop="sendStatus" :show-overflow-tooltip="true" align="center">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.sendStatus ==='0'" size="small" type="primary">{{ $t('table.notice.sendStatus0') }}</el-tag>
          <el-tag v-else-if="scope.row.sendStatus ==='1'" size="small" type="success">{{ $t('table.notice.sendStatus1') }}</el-tag>
          <el-tag v-else-if="scope.row.sendStatus ==='2'" size="small" type="info">{{ $t('table.notice.sendStatus2') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.notice.sendTime')" prop="sendTime" :show-overflow-tooltip="true" align="center" min-width="140px">
        <template slot-scope="scope">
          <span>{{ scope.row.sendTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.notice.cancelTime')" prop="cancelTime" :show-overflow-tooltip="true" align="center" min-width="140px">
        <template slot-scope="scope">
          <span>{{ scope.row.cancelTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width" fixed="right">
        <template slot-scope="{row}">
          <i v-if="row.sendStatus ==='0'" v-hasPermission="['notice:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i v-if="row.sendStatus ==='0'" v-hasPermission="['notice:release']" class="el-icon-s-promotion table-operation" style="color: #2db7f5;" @click="releaseData(row)" />
          <i v-if="row.sendStatus ==='1'" v-hasPermission="['notice:revoke']" class="el-icon-s-release table-operation" style="color: #2db7f5;" @click="revokeData(row)" />
          <i v-if="row.sendStatus !=='1'" v-hasPermission="['notice:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <el-link v-has-no-permission="['notice:update','notice:delete','notice:release','notice:revoke']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <notice-edit
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
import NoticeEdit from './Edit'

export default {
  name: 'NoticeManage',
  components: { Pagination, NoticeEdit },
  filters: {
    msgCategoryFilter(status) {
      const map = {
        1: 'success',
        2: 'primary'
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
      this.$refs.edit.setNotice(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
      this.dialog.type = 'edit'
    },
    releaseData(row) {
      this.$get(`msg/notice/release/${row.id}`).then((r) => {
        this.$message({
          message: this.$t('tips.release') + r.data.data,
          type: 'success'
        })
        this.search()
      })
    },
    revokeData(row) {
      this.$get(`msg/notice/revoke/${row.id}`).then((r) => {
        this.$message({
          message: this.$t('tips.revoke') + r.data.data,
          type: 'success'
        })
        this.search()
      })
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
          ids.push(c.id)
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
      this.$delete(`msg/notice/${ids}`).then(() => {
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
      this.$get('msg/notice/list', {
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
