<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-input v-model="listQuery.alias" placeholder="alias/username" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.mobile" placeholder="mobile" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.sex" placeholder="sex" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in sex" :key="item.name" :label="item.name" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.enabled" placeholder="enabled" clearable style="width: 110px" class="filter-item">
        <el-option v-for="item in enabled" :key="item.name" :label="item.name" :value="item.value" />
      </el-select>
      <!--      <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">-->
      <!--        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />-->
      <!--      </el-select>-->
      <!--      <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">-->
      <!--        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />-->
      <!--      </el-select>-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-delete" @click="clearFilter">
        Clear
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-delete-solid" @click="btcDelete">
        BTCD
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
      <!--            <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">-->
      <!--              reviewer-->
      <!--            </el-checkbox>-->
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
      @sort-change="sortChange"
    >
      <!--      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.id }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column label="Date" width="150px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--            <el-table-column label="Title" min-width="150px">-->
      <!--              <template slot-scope="{row}">-->
      <!--                <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>-->
      <!--                <el-tag>{{ row.type | typeFilter }}</el-tag>-->
      <!--              </template>-->
      <!--            </el-table-column>-->
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

      <el-table-column label="username" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="alias" align="center">
        <template slot-scope="{row}">
          <span>{{ row.alias }}</span>
        </template>
      </el-table-column>

      <el-table-column label="enabled" class-name="status-col" width="80" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.enabled | statusFilter">
            {{ row.enabled === 1 ? '禁用' : '启用' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="sex" class-name="status-col" width="55" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.sex | statusFilter">
            {{ row.sex === 1 ? '男' : '女' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="mobile" align="center" width="110" :rules="rules">
        <template slot-scope="{row}">
          <span>{{ row.mobile }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column v-if="showReviewer" label="Reviewer" width="110px" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span style="color:red;">{{ row.reviewer }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column label="Imp" width="80px">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <svg-icon v-for="n in + row.importance" :key="n" icon-class="star" class="meta-item__icon" />-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column label="Readings" align="center" width="95">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>-->
      <!--          <span v-else>0</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <!--          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">-->
          <!--            Publish-->
          <!--          </el-button>-->
          <!--          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">-->
          <!--            Draft-->
          <!--          </el-button>-->
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--表格分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

    <!--表单-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <!--        <el-form-item label="Type" prop="type">-->
        <!--          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">-->
        <!--            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />-->
        <!--          </el-select>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item label="Date" prop="timestamp">-->
        <!--          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />-->
        <!--        </el-form-item>-->
        <el-form-item label="alias" prop="alias">
          <el-input v-model="temp.alias" />
        </el-form-item>
        <el-form-item label="username" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item
          label="mobile"
          prop="mobile"
        >
          <el-input v-model.number="temp.mobile" />
        </el-form-item>
        <el-form-item label="sex">
          <el-select v-model="temp.sex" class="filter-item" placeholder="Please select">
            <el-option v-for="item in sex" :key="item.name" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="enabled">
          <el-select v-model="temp.enabled" class="filter-item" placeholder="Please select">
            <el-option v-for="item in enabled" :key="item.name" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
        <!--        <el-form-item label="Imp">-->
        <!--          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />-->
        <!--        </el-form-item>-->
        <el-form-item label="introduction">
          <el-input v-model="temp.introduction" :autosize="{ minRows: 4, maxRows: 6}" type="textarea" placeholder="Please input" />
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
import { fetchList, fetchPv, createArticle, updateArticle, fetchArticle, fetchArticles } from '@/api/article'
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
  name: 'ComplexTable',
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
    var mobile = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('mobile is not null'))
      } else {
        const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (reg.test(value)) return callback()
        Notification.error({
          title: 'mobile',
          message: '只允许是纯数字的11个字符的mobile'
        })
        // callback(new Error('手机号码格式不正确'))
      }
    }
    var username = (rule, value, callback) => {
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
    var alias = (rule, value, callback) => {
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
    var sex = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('sex is not null'))
      } else {
        const reg = /^[0-9]{1}$/
        if (reg.test(value)) return callback()
        Notification.error({
          title: '错误',
          message: '只允许1个字母类型的字符'
        })
        // callback(new Error('只允许是字母、数字组合且最大支持20个字符的alias'))
      }
    }
    return {
      tableKey: 0,
      isDisabled: false,
      // 表格字段
      list: [
        { alias: '',
          avatar: '',
          enabled: 0,
          id: '',
          introduction: '',
          mobile: '',
          sex: 0,
          username: ''
        }
      ],
      // 查询总条数
      total: 0,
      // 表格加载属性
      listLoading: true,
      // 查询字段
      listQuery: {
        current: 1,
        size: 10,
        mobile: undefined,
        alias: undefined,
        sex: undefined,
        enabled: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      enabled: [{ name: '禁用', value: 1 }, { name: '启用', value: 0 }],
      showReviewer: false,
      temp: {
        id: undefined,
        avatar: '',
        alias: '张三',
        enabled: 0,
        sex: 0,
        introduction: '这是一个测试账号',
        mobile: '13118854424',
        username: 'zs'
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
        mobile: [
          { validator: mobile, trigger: 'blur' }
        ],
        username: [
          { validator: username, trigger: 'blur' }
        ],
        alias: [
          { validator: alias, trigger: 'blur' }
        ],
        sex: [
          { validator: sex, trigger: 'blur' }
        ],
        enabled: [
          { validator: sex, trigger: 'blur' }
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
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        console.log(response)
        this.list = response.data
        this.total = response.total

        // Just to simulate the time of the request
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
        avatar: '',
        alias: '张三',
        enabled: 0,
        sex: 0,
        introduction: '这是一个测试账号',
        mobile: '13118854424',
        username: 'zs'
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
        this.isDisabled = true
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'http://localhost:8080/cn/images/2021/10/26/f778738c-e4f8-4870-b634-56703b4acafe.gif'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
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
        const tHeader = ['alias', 'username', 'sex', 'introduction', 'mobile']
        const filterVal = ['alias', 'username', 'sex', 'introduction', 'mobile']
        const data = this.formatJson(filterVal)
        for (const datum of data) {
          datum[2] = (datum[2] === 1 ? '男' : '女')
        }
        console.log(data)
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
