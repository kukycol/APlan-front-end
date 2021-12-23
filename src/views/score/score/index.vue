<template>
  <div class="app-container">

    <h1 v-if="!isAuth('sys:activity') && status === 1 ">评分活动还没开始，请稍后再试</h1>

    <!--表单-->
    <el-form v-if="status === 0 && !isAuth('sys:activity')" ref="dataForm" :inline="true" :rules="rules" :model="list" label-position="right" label-width="140px">
      <el-form-item v-for="(a,index) in list" :label="a.username">
        <!--          <el-form-item :label="b.scoreContent"  v-for="b in a.scoreList">-->
        <!--            <el-input-number v-model="list.scoreMax" :min="1" :max="b.scoreMax"  controls-position="right"/>-->
        <!--          </el-form-item>-->
        <el-form-item label="综合素质">
          <el-input-number v-model="list[index].score1" :min="1" :max="20" controls-position="right" />
        </el-form-item>
        <el-form-item label="精神作风">
          <el-input-number v-model="list[index].score2" :min="1" :max="40" controls-position="right" />
        </el-form-item>
        <el-form-item label="工作业绩">
          <el-input-number v-model="list[index].score3" :min="1" :max="40" controls-position="right" />
        </el-form-item>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button v-if="!isAuth('sys:activity') && status === 0 " :disabled="isDisabled" type="primary" @click="createData()">
        提交评分
      </el-button>
      <el-button v-if="isAuth('sys:activity')" type="primary" @click="updateData()">
        {{ status === 1 ? '启动评分活动' : '关闭评分活动' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { createDepartEmployee, getActivityStatus, ListDepartEmployee, updateActivity } from '@/api/depart-employee-table'
import { fetchRuleList } from '@/api/rule-table'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { Notification } from 'element-ui'
import store from '@/store'

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
  name: 'Score',
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
    var role = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('username is not null'))
      } else {
        const reg = /^[A-Za-z0-9]{2,20}$/
        if (reg.test(value)) return callback()
        Notification.error({
          title: 'username',
          message: '只允许是字母、数字组合且最大支持20个字符的username'
        })
        // callback(new Error('只允许是字母、数字组合且最大支持20个字符的username'))
      }
    }
    var roleName = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('alias is not null'))
      } else {
        const reg = /^[\u4E00-\u9FA5A-Za-z0-9_]{2,20}$/
        if (reg.test(value)) return callback()
        Notification.error({
          title: 'alias',
          message: '只允许是中文、字母、数字组合且最大支持20个字符的alias'
        })
        // callback(new Error('只允许是字母、数字组合且最大支持20个字符的alias'))
      }
    }
    return {
      tableKey: 0,
      isDisabled: false,
      ruleList: [],
      // 表格字段
      list: [
        {
          roleName: '',
          role: '',
          roleRemark: '',
          id: ''
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
        size: 10
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      isSystem: [{ name: '否', value: 1 }, { name: '是', value: 0 }],
      showReviewer: false,
      betDelEnabled: false,
      temp: {
        scoreId: undefined,
        scoreContent: '',
        scoreType: 0,
        scoreMax: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      status: 0,
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        roleName: [
          { validator: roleName, trigger: 'blur', required: true }
        ],
        role: [
          { validator: role, trigger: 'blur', required: true }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()

    // if (store.getters.userId === '1') {
    this.getActivityStatus()
    // }
  },
  methods: {
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
      ListDepartEmployee().then(response => {
        console.log(response)
        this.list = response.data

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        })
      })
    },
    getActivityStatus() {
      this.listLoading = true
      getActivityStatus().then(response => {
        console.log(response)
        this.status = response.data

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
        paramKey: undefined,
        isSystem: undefined,
        paramName: undefined
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
      this.temp = {
        scoreId: undefined,
        scoreContent: '',
        scoreType: 0,
        scoreMax: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.isDisabled = false
      this.getRuleList()
      // 清除表单字段数据
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      updateActivity().then((res) => {
        if (res.code === 20000) {
          this.$notify({
            title: 'Success',
            message: res.message,
            type: 'success',
            duration: 2000
          })
        }
        this.getActivityStatus()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log(this.list)
          createDepartEmployee({ 'scores': this.list }).then((res) => {
            if (res.code === 20000) {
              // 显示表单提示按钮
              this.isDisabled = true
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: res.message,
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
