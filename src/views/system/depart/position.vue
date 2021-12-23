<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-input v-model="listQuery.positionName" placeholder="输入昵称或者用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.positionStatus" placeholder="选择状态" clearable style="width: 110px" class="filter-item">
        <el-option v-for="item in positionStatus" :key="item.name" :label="item.name" :value="item.value" />
      </el-select>
      <el-button v-if="isAuth('sys:user:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-delete" @click="clearFilter">
        刷新
      </el-button>
      <el-button v-if="betDelEnabled" v-waves class="filter-item" type="primary" icon="el-icon-delete-solid" @click="btcDelete">
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

      <el-table-column label="职位名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.positionName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="所属部门" align="center">
        <template slot-scope="{row}">
          <span>{{ row.departName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职位排序" align="center">
        <template slot-scope="{row}">
          <span>{{ row.positionSort }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column label="职位状态" class-name="status-col" width="75" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <el-tag :type="row.positionStatus | statusFilter">-->
      <!--            {{ row.positionStatus === 0 ? '启用' : '禁用' }}-->
      <!--          </el-tag>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <el-table-column v-if="isAuth('sys:user:status')" label="职位状态" class-name="status-col" width="120" align="center">
        <template slot-scope="{row}">
          <el-tooltip :content="row.enabled === 0 ? '启用':'禁用'" placement="top">
            <el-switch
              v-model="row.positionStatus"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="0"
              :inactive-value="1"
              @change="handleSwitch(row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--表格分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getTablePage" />

    <!--表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 400px;
        margin-left:50px;"
      >
        <el-form-item label="职位名称" prop="positionName">
          <el-input v-model="temp.positionName" />
        </el-form-item>
        <el-form-item label="职位排序" prop="positionSort">
          <el-input v-model="temp.positionSort" />
        </el-form-item>
        <el-form-item label="职位状态">
          <el-select v-model="temp.positionStatus" class="filter-item" placeholder="Please select">
            <el-option v-for="item in positionStatus" :key="item.name" :label="item.name" :value="item.value" />
          </el-select>
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
import { pagePosition, delPosition, btcPosition, createPosition, updatePosition } from '@/api/depart-position-table'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'
import { Notification } from 'element-ui'
// import { Notification } from 'element-ui'

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
  name: 'Position',
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
      departList: [],
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
        positionStatus: undefined,
        departId: undefined,
        positionName: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      isSystem: [{ name: '是', value: 0 }, { name: '否', value: 1 }],
      positionStatus: [{ name: '禁用', value: 1 }, { name: '启用', value: 0 }],
      showReviewer: false,
      betDelEnabled: false,
      temp: {
        positionId: undefined,
        departId: undefined,
        positionName: undefined,
        positionStatus: 0,
        positionSort: 1
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
    this.getTablePage()
    if (this.$route.query) {
      this.listQuery.departId = this.$route.query.departId
    }
  },
  methods: {
    handleSwitch(row) {
      console.log(row)
      const data = {
        positionStatus: row.positionStatus,
        positionId: row.positionId
      }
      updatePosition(data).then(() => {
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
    getTablePage() {
      this.listLoading = true
      pagePosition(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data
        this.total = response.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        })
      })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getTablePage()
    },
    clearFilter() {
      // 清空搜索条件
      this.listQuery = {
        current: 1,
        size: 10,
        positionStatus: undefined,
        positionName: undefined
      }

      // 设定必要搜索条件
      this.listQuery.departId = this.$route.query.departId
      this.getTablePage()
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
        positionId: undefined,
        departId: this.$route.query.departId,
        positionName: undefined,
        positionStatus: 0,
        positionSort: 1
      }
      // 显示表单提示按钮
      this.isDisabled = false
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      // 清除表单字段数据
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    btcDelete() {
      const dd = this.$refs.multipleTable.selection
      let ids = ''
      for (const ddElement of dd) {
        ids += ',' + ddElement.dictItemId
      }
      ids = ids.substring(1)
      btcPosition({ 'ids': ids }).then((res) => {
        if (res.code === 20000) {
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
          this.listQuery.current = 1
          this.clearFilter()
        }
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        this.isDisabled = true
        if (valid) {
          createPosition(this.temp).then(() => {
            // this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.clearFilter()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          updatePosition(tempData).then(() => {
            // const index = this.list.findIndex(v => v.id === this.temp.id)
            // this.temp.ruleList = tempData.ruleList
            // this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.clearFilter()
          })
        }
      })
    },
    handleDelete(row, index) {
      delPosition(row.dictItemId).then((res) => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
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
