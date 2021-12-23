<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-input v-model="listQuery.jobName" placeholder="任务名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-if="isAuth('sys:role:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button v-if="isAuth('sys:role:refresh')" v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
        刷新
      </el-button>
      <el-button v-if="isAuth('sys:role:save')" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <!--      <el-button v-if="isAuth('sys:role:export')" v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">-->
      <!--        导出-->
      <!--      </el-button>-->
      <el-button v-if="betDelEnabled && isAuth('sys:role:btc')" v-waves class="filter-item" type="primary" icon="el-icon-delete-solid" @click="btcDelete">
        批量删除
      </el-button>
    </div>
    <!--表格数据-->
    <el-table
      :key="tableKey"
      ref="multipleTable"
      v-loading="listLoading"
      :data="list"
      border
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

      <el-table-column label="任务名称" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.jobName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="bean名称" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.beanName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="执行方法" align="center" width="120" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.methodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参数" align="center" width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.params }}</span>
        </template>
      </el-table-column>
      <el-table-column label="cron表达式" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.cronExpression }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务状态" class-name="status-col" width="90" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <el-tooltip :content="row.status === 0 ? '运行中':'暂停'" placement="top">
            <el-switch
              v-model="row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="0"
              :inactive-value="1"
              @change="handleJobStatusSwitch(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="170" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="isAuth('sys:role:update')" label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleRun(row)">
            立即执行
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:role:del')" size="mini" type="danger" @click="handleDelete(row,$index)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--表格分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <!--表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="120px"
        style="width: 400px;
        margin-left:50px;"
      >
        <el-form-item label="任务名称" prop="jobName">
          <el-input v-model="temp.jobName" />
        </el-form-item>
        <el-form-item label="bean名称" prop="beanName">
          <el-input v-model="temp.beanName" />
        </el-form-item>
        <el-form-item label="执行方法" prop="methodName">
          <el-input v-model="temp.methodName" />
        </el-form-item>
        <el-form-item label="参数" prop="params">
          <el-input v-model="temp.params" />
        </el-form-item>
        <el-form-item label="cron表达式" prop="cronExpression">
          <el-input v-model="temp.cronExpression" />
          <el-tag
            key="cron"
            type="warning"
            effect="dark"
          >
            <span>cron在线生成地址：<a href="https://cron.qqe2.com/" target="_blank">https://cron.qqe2.com/</a></span>
          </el-tag>
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="temp.remark" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button :disabled="isDisabled" type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { updateStatusJob, updateJob, createJob, btcJob, delJob, pageJob, runJob } from '@/api/job-table'
import { fetchRuleList } from '@/api/rule-table'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { Notification } from 'element-ui'

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
        { jobName: '',
          beanName: '',
          methodName: '',
          cronExpression: '',
          remark: '',
          createTime: '',
          status: 0,
          params: ''
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
        jobName: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      JobStatus: [{ name: '暂停', value: 1 }, { name: '运行中', value: 0 }],
      showReviewer: false,
      betDelEnabled: false,
      temp: { jobName: '测试任务',
        beanName: '',
        methodName: '',
        cronExpression: '',
        remark: '',
        createTime: '',
        status: 0,
        params: ''
      },
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
    handleJobStatusSwitch(row) {
      console.log(row)
      const data = {
        status: row.status,
        jobId: row.jobId
      }
      updateStatusJob(data).then(() => {
        Notification({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
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
      this.betDelEnabled = val1.length > 0
    },
    handleSelectAll(val) {
      this.betDelEnabled = val.length > 0
    },
    getList() {
      this.listLoading = true
      pageJob(this.listQuery).then(response => {
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
    resetTemp() {
      this.temp =
        { jobName: '测试任务',
          beanName: '',
          methodName: '',
          cronExpression: '',
          remark: '',
          createTime: '',
          status: 0,
          params: ''
        }
      this.enabled = false
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getRuleList()
      this.isDisabled = false
      // 清除表单字段数据
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    btcDelete() {
      const dd = this.$refs.multipleTable.selection
      let ids = ''
      for (const ddElement of dd) {
        ids += ',' + ddElement.jobId
      }
      ids = ids.substring(1)
      btcJob({ 'ids': ids }).then((res) => {
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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // console.log(this.$refs.tree.getCheckedKeys ())
          // this.temp.ruleList = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
          // this.temp.ruleList = this.$refs.tree.getCheckedKeys()
          createJob(this.temp).then((res) => {
            if (res.code === 20000) {
              // 显示表单提示按钮
              this.isDisabled = true
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
            // this.list.unshift(this.temp)
          })
        }
      })
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
    handleRun(row) {
      runJob([row.jobId]).then((res) => {
        if (res.code === 20000) {
          // const index = this.list.findIndex(v => v.id === this.temp.id)
          // this.temp.ruleList = tempData.ruleList
          // this.list.splice(index, 1, this.temp)
          // this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Update Successfully',
            type: 'success',
            duration: 2000
          })
          // this.getList()
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          // tempData.ruleList = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
          updateJob(tempData).then((res) => {
            if (res.code === 20000) {
              // const index = this.list.findIndex(v => v.id === this.temp.id)
              this.temp.ruleList = tempData.ruleList
              // this.list.splice(index, 1, this.temp)
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
              this.getList()
            }
          })
        }
      })
    },
    handleDelete(row, index) {
      delJob({ 'ids': row.jobId }).then((res) => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        console.log(index)
        this.list.splice(index, 1)
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
