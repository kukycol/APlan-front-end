<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="登录名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.ipv4" placeholder="ip地址" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-if="isAuth('sys:role:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button v-if="isAuth('sys:role:refresh')" v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
        刷新
      </el-button>
      <el-button v-if="btcQuitStatus && isAuth('sys:role:btc')" v-waves class="filter-item" type="primary" icon="el-icon-delete-solid" @click="btcForceQuit">
        批量强退
      </el-button>
    </div>
    <!--表格数据-->
    <el-table
      :key="tableKey"
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      fit
      highlight-current-row
      style="width: 100%;"
      :row-class-name="tableRowClassName"
      @select="handleSelect"
      @select-all="handleSelectAll"
      @sort-change="sortChange"
    >

      <el-table-column
        type="index"
        align="center"
        width="55"
      />
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />

      <el-table-column label="账号" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称" align="center" width="120">
        <template slot-scope="{row}">
          <span>{{ row.alias }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门 / 职位" align="center">
        <template slot-scope="{row}">
          <span>{{ row.departName }} / {{ row.positionName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ipv4" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ipv4 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="浏览器名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.browserName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="isAuth('sys:role:update')" label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="forceQuit(row)">
            强退
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--表格分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
import { pageOnline, quit } from '@/api/online-table'
import { fetchRuleList } from '@/api/rule-table'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'Job',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      isDisabled: false,
      ruleList: [],
      // 表格字段
      list: [
        { username: '',
          alias: '',
          departName: '',
          positionName: '',
          ipv4: '',
          createTime: '',
          browserName: ''
        }
      ],
      defaultProps2: {
        children: 'children',
        label: 'ruleName',
        disabled: 'disabled2'
      },
      // 查询总条数
      total: 0,
      // 表格加载属性
      listLoading: true,
      // 查询字段
      listQuery: {
        current: 1,
        size: 10,
        username: undefined,
        ipv4: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      JobStatus: [{ name: '暂停', value: 1 }, { name: '运行中', value: 0 }],
      showReviewer: false,
      btcQuitStatus: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    forceQuit(row) {
      quit({ 'keys': row.token }).then((res) => {
        this.$notify({
          title: 'Success',
          message: res.message,
          type: 'success',
          duration: 2000
        })
      })

      this.getList()
    },
    btcForceQuit() {
      const dd = this.$refs.multipleTable.selection
      let keys = ''
      for (const ddElement of dd) {
        keys += ',' + ddElement.token
      }
      keys = keys.substring(1)
      quit({ 'keys': keys }).then((res) => {
        if (res.code === 20000) {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.listQuery.current = 1
          this.getList()
        }
      })
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },
    handleSelect(val1, val2) {
      this.btcQuitStatus = val1.length > 0
    },
    handleSelectAll(val) {
      this.btcQuitStatus = val.length > 0
    },
    getList() {
      this.listLoading = true
      pageOnline(this.listQuery).then(response => {
        this.list = response.data
        this.total = response.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        })
      })
    },
    getRuleList(params) {
      this.listLoading = true
      fetchRuleList(params).then(response => {
        console.log(response)
        this.ruleList = response.data

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        })
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    clearFilter() {
      this.listQuery = {
        current: 1,
        size: 10,
        jobName: undefined
      }
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getRuleList()
      // 清除表单字段数据
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    handleUpdate(row) {
      this.getRuleList()
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      console.log(this.temp)
      this.isDisabled = false
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['role', 'roleName', 'roleRemark']
        const filterVal = ['role', 'roleName', 'roleRemark']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
