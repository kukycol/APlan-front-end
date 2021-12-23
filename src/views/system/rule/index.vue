<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <!--搜索条件-->
      <el-input v-model="listQuery.ruleName" placeholder="权限地址/权限名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <!--按钮组-->
      <el-button v-if="isAuth('sys:rule:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button v-if="isAuth('sys:rule:refresh')" v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
        刷新
      </el-button>
      <el-button v-if="isAuth('sys:rule:save')" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        新增
      </el-button>
    </div>

    <!--表格数据-->
    <el-table
      :data="list"
      :default-expand-all="false"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      style="width: 100%;margin-bottom: 20px;"
      row-key="id"
      border
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="权限类型" prop="ruleType" align="center" width="200">
        <template slot-scope="{row}">
          <el-tag :type="row.ruleType | statusFilter">
            {{ row.ruleType === 0 ? '目录' : (row.ruleType === 1 ? '菜单' : '权限') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="图标" align="center" width="50">
        <template slot-scope="{row}">
          <svg-icon :icon-class="row.ruleIcon" />
        </template>
      </el-table-column>
      <el-table-column label="权限名称" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ruleName }}</span>
        </template>
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.ruleName }}</span>
          <!--          <el-tag>{{ row.type | typeFilter }}</el-tag>-->
        </template>
      </el-table-column>

      <el-table-column label="权限地址" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.ruleUrl }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限" align="center">
        <template slot-scope="{row}">
          <span>{{ row.perms }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限备注" :show-overflow-tooltip="true" align="center">
        <template slot-scope="{row}">
          <span>{{ row.ruleRemark }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限排序" align="center" width="90">
        <template slot-scope="{row}">
          <span>{{ row.ruleOrder }}</span>
        </template>
      </el-table-column>
      <el-table-column label="路由隐藏" prop="hidden" align="center" width="200">
        <template slot-scope="{row}">
          <el-tag :type="row.ruleHide | statusFilter">
            {{ row.ruleHide === 0 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="isAuth('sys:rule:update')" type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">
            修改
          </el-button>
          <el-button v-if="isAuth('sys:rule:del')" size="mini" type="danger" icon="el-icon-delete-solid" @click="handleDelete(row,$index)">
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
        <el-form-item label="菜单类型" prop="ruleType">
          <el-radio-group v-model="temp.ruleType" size="small" @change="radioChange">
            <el-radio-button :label="0">目录</el-radio-button>
            <el-radio-button :label="1">菜单</el-radio-button>
            <el-radio-button :label="2">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="temp.ruleType !== 2" label="菜单图标" prop="icon">
          <el-popover
            placement="bottom-start"
            width="450"
            trigger="click"
            @show="$refs['iconSelect'].reset()"
          >
            <IconSelect ref="iconSelect" @selected="selected" />
            <el-input slot="reference" v-model="temp.ruleIcon" style="width: 450px;" placeholder="点击选择图标" readonly>
              <svg-icon v-if="temp.ruleIcon" slot="prefix" :icon-class="temp.ruleIcon" class="el-input__icon" style="height: 32px;width: 16px;" />
              <i v-else slot="prefix" class="el-icon-search el-input__icon" />
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item v-if="temp.ruleType !== 2" label="外链菜单" prop="outsideMenu">
          <el-radio-group v-model="temp.outsideMenu" size="small">
            <el-radio-button :label="0">是</el-radio-button>
            <el-radio-button :label="1">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="菜单缓存" prop="cacheMenu">
          <el-radio-group v-model="temp.noCache" size="small">
            <el-radio-button :label="0">是</el-radio-button>
            <el-radio-button :label="1">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="temp.ruleType !== 2" label="菜单可见" prop="visibleMenu">
          <el-radio-group v-model="temp.ruleHide" size="small">
            <el-radio-button :label="0">是</el-radio-button>
            <el-radio-button :label="1">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 2" label="按钮名称" prop="ruleName">
          <el-input v-model="temp.ruleName" placeholder="按钮名称" class="demo-input" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 0" label="目录标题" prop="ruleName">
          <el-input v-model="temp.ruleName" placeholder="目录标题" class="demo-input" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="菜单标题" prop="ruleName">
          <el-input v-model="temp.ruleName" placeholder="菜单标题" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType !== 0" label="权限标识" prop="perms">
          <el-input v-model="temp.perms" placeholder="权限标识" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType !== 2" label="路由地址" prop="ruleUrl">
          <el-input v-model="temp.ruleUrl" placeholder="路由地址" />
        </el-form-item>
        <el-form-item label="菜单排序" prop="ruleOrder">
          <el-input-number v-model="temp.ruleOrder" controls-position="right" :min="1" :max="100" class="demo-select" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="组件名称" prop="componentName">
          <el-input v-model="temp.componentName" placeholder="组件名称" />
        </el-form-item>
        <el-form-item v-if="temp.ruleType === 1" label="组件路径" prop="componentPath">
          <el-input v-model="temp.componentPath" placeholder="组件路径" />
        </el-form-item>
        <el-form-item label="上级类目" prop="parentId">
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
import IconSelect from '@/components/IconSelect'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import {
  fetchRuleList,
  fetchPv,
  createArticle,
  updateArticle,
  fetchParentList
} from '@/api/rule-table'
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
  name: 'Rule',
  components: { IconSelect, Treeselect },
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
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        ruleName: undefined,
        perms: undefined,
        ruleType: 0,
        ruleIcon: undefined,
        parentId: undefined,
        componentPath: undefined,
        componentName: undefined,
        ruleOrder: 1,
        ruleRemark: undefined,
        ruleUrl: undefined,
        ruleHide: 0,
        noCache: 1,
        children: [],
        outsideMenu: 1
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
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        ruleIcon: [{ required: true, message: '请选择图标', trigger: 'change' }],
        ruleUrl: [{ required: true, message: '请输入路由地址', trigger: 'change' }]
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
    // 选中图标
    selected(name) {
      this.temp.ruleIcon = name
    },
    // 树表格数据
    getList() {
      this.listLoading = true
      fetchRuleList(this.listQuery).then(response => {
        this.list = response.data
      })
    },
    // 父级树型数据
    getParentList(ruleLevel) {
      this.parentQuery.ruleLevel = ruleLevel
      fetchParentList(this.parentQuery).then(response => {
        console.log(response)
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
        id: undefined,
        ruleName: undefined,
        perms: undefined,
        ruleType: 0,
        ruleIcon: undefined,
        parentId: undefined,
        componentPath: undefined,
        componentName: undefined,
        ruleOrder: 1,
        ruleRemark: undefined,
        ruleUrl: undefined,
        ruleHide: 0,
        noCache: 0,
        children: [],
        outsideMenu: 1
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
          createArticle(this.temp).then(() => {
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
      console.log(this.temp)
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
          updateArticle(tempData).then(() => {
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

      // this.$notify({
      //   title: 'Success',
      //   message: 'Delete Successfully',
      //   type: 'success',
      //   duration: 2000
      // })
      // this.list.splice(index, 1)
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
