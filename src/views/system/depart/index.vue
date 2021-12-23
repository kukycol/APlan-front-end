<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <!--搜索条件-->
      <el-input v-model="listQuery.departName" placeholder="部门名称" style="width: 200px;margin-right: 10px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <!--按钮组-->
      <el-button v-if="isAuth('sys:depart:tree:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button v-if="isAuth('sys:depart:tree:refresh')" v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
        刷新
      </el-button>
      <el-button v-if="isAuth('sys:depart:tree:save')" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        新增
      </el-button>
<!--      <el-button  class="filter-item" type="primary" icon="el-icon-plus" @click="handleImport">-->
<!--        导入-->
<!--      </el-button>-->
      <el-upload
        class="upload-demo"
        action="https://jsonplaceholder.typicode.com/posts/"
        multiple
        :limit="3"
      >
        <el-button size="small" type="primary">导入</el-button>
      </el-upload>
    </div>

    <!--表格数据-->
    <el-table
      :data="list"
      :default-expand-all="false"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      style="width: 100%;margin-bottom: 20px;"
      row-key="departId"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="部门名称" align="left" prop="departName">
        <!--        <template slot-scope="{row}">-->
        <!--          <span>{{ row.departName }}</span>-->
        <!--        </template>-->
        <template slot-scope="{row}">
          <span class="link-type" @click="jumpPosition(row)">{{ row.departName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部门状态" prop="departStatus" align="center" width="200">
        <template slot-scope="{row}">
          <el-switch
            v-model="row.departStatus"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :active-value="0"
            :inactive-value="1"
            @change="departStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" width="200">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="isAuth('sys:depart:tree:update')" type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:depart:tree:delete')" size="mini" type="danger" icon="el-icon-delete-solid" @click="handleDelete(row,$index)">
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--表单弹窗-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="32%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="80px"
        :inline="true"
      >
        <el-form-item label="部门名称" prop="departName">
          <el-input v-model="temp.departName" placeholder="部门名称" class="demo-input" />
        </el-form-item>
        <el-form-item label="部门状态" prop="departStatus">
          <el-radio-group v-model="temp.departStatus" size="small">
            <el-radio-button :label="0">启用</el-radio-button>
            <el-radio-button :label="1">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <treeselect v-model="temp.parentId" :options="parentList" style="width: 450px;" placeholder="选择上级类目" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          提交
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
<style>
  .demo-input {
    width: 477px;
  }
  .demo-select {
    width: 187px;
  }
</style>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {
  queryTree,
  del,
  create,
  update,
  fetchParentList
} from '@/api/depart-table'
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
  name: 'Depart',
  components: { Treeselect },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'success',
        1: 'danger',
        2: 'info'
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
      restaurants: [],
      parentList: [],
      list: [],
      total: 0,
      listLoading: true,
      dialogWidth: '30%',
      listQuery: {
        page: 1,
        limit: 20,
        departName: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        departId: undefined,
        departName: undefined,
        departStatus: 0,
        parentId: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑部门',
        create: '新增部门'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        ruleIcon: [{ required: true, message: '请选择图标', trigger: 'change' }]
      },
      downloadLoading: false,
      // 父级查询字段
      parentQuery: {
        id: undefined,
        ruleLevel: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 启用与禁用
    departStatusChange(row) {
      update(row).then(() => {
      })
    },
    // 树表格数据
    getList() {
      this.listLoading = true
      queryTree(this.listQuery).then(response => {
        this.list = response.data
      })
    },
    jumpPosition(row) {
      // this.$router.push('/item' )
      this.$router.push({
        name: 'Position',
        query: { departId: row.departId }
      })
    },
    // 父级树型数据
    getParentList(ruleLevel) {
      this.parentQuery.ruleLevel = ruleLevel
      fetchParentList(this.parentQuery).then(response => {
        this.parentList = []
        this.parentList = response.data
        // this.parentList.push(...response.data)
      })
    },
    // 切换权限类型按钮
    radioChange(val) {
      // this.resetTemp()
      this.temp.ruleType = val
      this.getParentList(val)
    },
    handleFilter() {
      this.listQuery.page = 1
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
        departId: undefined,
        departName: undefined,
        departStatus: 0,
        parentId: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getParentList(0)

      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
    },
    handleImport() {

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
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          create(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.getParentList(this.temp.ruleType)
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          update(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleDelete(row, index) {
      del(row.departId).then(() => {
        // const index = this.list.findIndex(v => v.id === this.temp.id)
        // this.list.splice(index, 1, this.temp)
        this.dialogFormVisible = false
        this.$notify({
          title: 'Success',
          message: 'Update Successfully',
          type: 'success',
          duration: 2000
        })
        this.getList()
      })
      // this.list.splice(index, 1)
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
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
