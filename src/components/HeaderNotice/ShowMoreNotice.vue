<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
    append-to-body
  >
    <div class="app-container">
      <div class="filter-container">
        <el-input v-model="queryParams.title" :placeholder="$t('table.notice.title')" class="filter-item search-item" />
        <el-button class="filter-item" type="primary" @click="search">
          {{ $t('table.search') }}
        </el-button>
        <el-button class="filter-item" type="success" @click="resetForm">
          {{ $t('table.reset') }}
        </el-button>
        <el-button class="filter-item" type="primary" @click="readAll">
          {{ $t('table.readAll') }}
        </el-button>
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
        <el-table-column :label="$t('table.notice.msgAbstract')" prop="cancelTime" :show-overflow-tooltip="true" align="center" min-width="140px">
          <template slot-scope="scope">
            <span>{{ scope.row.msgAbstract }}</span>
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
        <el-table-column :label="$t('table.notice.sendTime')" prop="sendTime" :show-overflow-tooltip="true" align="center" min-width="140px">
          <template slot-scope="scope">
            <span>{{ scope.row.sendTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.notice.readFlag')" prop="priority" :show-overflow-tooltip="true" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.readFlag ==='0'" size="small" type="success">{{ $t('table.notice.readFlag0') }}</el-tag>
            <el-tag v-else-if="scope.row.readFlag ==='1'" size="small" type="primary">{{ $t('table.notice.readFlag1') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('table.operation')" align="center" min-width="50px" class-name="small-padding fixed-width" fixed="right">
          <template slot-scope="{row}">
            <i class="el-icon-setting table-operation" style="color: #2db7f5;" @click="updateNoticeStatus(row)" />
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
    </div>
  </el-dialog>

</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'ShowMoreNotice',
  components: { Pagination },
  filters: {
    msgCategoryFilter(status) {
      const map = {
        1: 'success',
        2: 'primary'
      }
      return map[status]
    }
  },
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
    this.fetch()
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
    onSelectChange(selection) {
      this.selection = selection
    },
    filterStatus(value, row) {
      return row.status === value
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    search() {
      this.fetch({
        ...this.queryParams
      })
    },
    resetForm() {
      this.queryParams = {}
      this.search()
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('msg/notice/send/getMyNoticeSend', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    updateNoticeStatus(record) {
      this.$get(`msg/notice/send/editByNoticeIdAndUserId/${record.noticeId}`).then((r) => {
        if (r.data.data === true) {
          this.fetch()
        }
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    readAll() {
      this.$get(`msg/notice/send/readAll`).then((r) => {
        if (r.data.data === true) {
          this.this.fetch()()
        }
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    close() {
      this.$emit('close')
    },
    reset() {
      this.queryParams = {}
      this.search()
    }
  }
}
</script>

<style scoped>

</style>
