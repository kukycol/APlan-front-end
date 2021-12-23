<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        搜搜
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

      <el-table-column label="字典项名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dictItemText }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典项值" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dictItemValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典项序号" align="center">
        <template slot-scope="{row}">
          <span>{{ row.dictItemSort }}</span>
        </template>
      </el-table-column>
      <el-table-column label="字典项状态" class-name="status-col" width="120" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.dictItemStatus | statusFilter">
            {{ row.dictItemStatus === 0 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典项备注" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.dictItemRemark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--表格分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getTablePage" />

    <!--表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="dictItemText" prop="dictItemText">
          <el-input v-model="temp.dictItemText" />
        </el-form-item>
        <el-form-item label="dictItemValue" prop="dictItemValue">
          <el-input v-model="temp.dictItemValue" />
        </el-form-item>
        <el-form-item label="dictItemSort" prop="dictItemSort">
          <el-input v-model="temp.dictItemSort" />
        </el-form-item>
        <el-form-item label="dictItemRemark">
          <el-input v-model="temp.dictItemRemark" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="Please input" />
        </el-form-item>
        <el-form-item label="dictState">
          <el-select v-model="temp.dictItemStatus" class="filter-item" placeholder="Please select">
            <el-option v-for="item in dictItemStatus" :key="item.name" :label="item.name" :value="item.value" />
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
import { fetchDictPage, fetchDel, fetchBtcDel, createDict, updateDict } from '@/api/dict-item-table'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
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
  name: 'DictItem',
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
        dictId: undefined,
        dictCode: undefined,
        dictName: undefined,
        dictRemark: undefined,
        isSystem: undefined,
        dictState: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      isSystem: [{ name: '是', value: 0 }, { name: '否', value: 1 }],
      dictItemStatus: [{ name: '禁用', value: 1 }, { name: '启用', value: 0 }],
      showReviewer: false,
      betDelEnabled: false,
      temp: {
        dictId: undefined,
        dictItemId: undefined,
        dictItemText: undefined,
        dictItemValue: undefined,
        dictItemRemark: undefined,
        dictItemStatus: 0,
        dictItemSort: 1
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
      this.listQuery.dictId = this.$route.query.dictId
    }
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
    getTablePage() {
      this.listLoading = true
      fetchDictPage(this.listQuery).then(response => {
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
        dictId: this.$route.query.dictId,
        dictItemId: undefined,
        dictItemText: undefined,
        dictItemValue: undefined,
        dictItemRemark: undefined,
        dictItemStatus: 0,
        dictItemSort: 1
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
      fetchBtcDel({ 'ids': ids }).then((res) => {
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
          createDict(this.temp).then(() => {
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
          updateDict(tempData).then(() => {
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
      fetchDel(row.dictItemId).then((res) => {
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
