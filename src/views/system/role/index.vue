<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-input v-model="listQuery.role" placeholder="角色/角色名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.roleRemark" placeholder="角色备注" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-if="isAuth('sys:role:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button v-if="isAuth('sys:role:refresh')" v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
        刷新
      </el-button>
      <el-button v-if="isAuth('sys:role:save')" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-if="isAuth('sys:role:export')" v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <el-button v-if="betDelEnabled && isAuth('sys:role:btc')" v-waves class="filter-item" type="primary" icon="el-icon-delete-solid" @click="btcDelete">
        批量移除
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

      <el-table-column label="角色" align="center">
        <template slot-scope="{row}">
          <span>{{ row.role }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.roleName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色备注" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.roleRemark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" v-if="isAuth('sys:role:update')"  align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
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
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="role" prop="role">
          <el-input v-model="temp.role" />
        </el-form-item>
        <el-form-item label="roleName" prop="roleName">
          <el-input v-model="temp.roleName" />
        </el-form-item>
        <el-form-item label="roleRemark" prop="roleRemark">
          <el-input v-model="temp.roleRemark" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="ruleList" prop="ruleList">
          <div class="block">
            <el-tree
              ref="tree"
              :data="ruleList"
              show-checkbox
              node-key="id"
              default-expand-all
              :expand-on-click-node="false"
              :props="defaultProps2"
              :highlight-current="true"
              :default-checked-keys="temp.ruleList"
            />
          </div>
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

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createArticle, updateArticle, fetchArticle, fetchArticles } from '@/api/role-table'
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
  name: 'Role',
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
        { roleName: '',
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
        size: 10,
        role: undefined,
        roleRemark: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      enabled: [{ name: '禁用', value: 1 }, { name: '启用', value: 0 }],
      showReviewer: false,
      betDelEnabled: false,
      temp: {
        id: undefined,
        roleName: '测试角色',
        role: 'test',
        roleRemark: '这个是一个测试角色',
        ruleList: []
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
      fetchList(this.listQuery).then(response => {
        console.log(response)
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
        mobile: undefined,
        alias: undefined,
        sex: undefined,
        enabled: undefined
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
        id: undefined,
        roleName: '测试角色',
        role: 'test',
        roleRemark: '这个是一个测试角色',
        ruleList: []
      }
      this.enabled = false
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
    btcDelete() {
      const dd = this.$refs.multipleTable.selection
      let ids = ''
      for (const ddElement of dd) {
        ids += ',' + ddElement.id
      }
      ids = ids.substring(1)
      fetchArticles({ 'ids': ids }).then((res) => {
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
          this.temp.ruleList = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
          // this.temp.ruleList = this.$refs.tree.getCheckedKeys()
          createArticle(this.temp).then((res) => {
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
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          tempData.ruleList = this.$refs.tree.getCheckedKeys().concat(this.$refs.tree.getHalfCheckedKeys())
          updateArticle(tempData).then((res) => {
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
      fetchArticle(row.id).then((res) => {
        console.log(res)
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
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
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
