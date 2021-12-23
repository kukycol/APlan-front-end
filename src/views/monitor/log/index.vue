<template>
  <div class="app-container">
    <!--搜索-->
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="登录名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.path" placeholder="接口地址" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.deviceName" placeholder="设备名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-input v-model="listQuery.ip" placeholder="ip" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.method" placeholder="请求方式" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in method" :key="item.name" :label="item.name" :value="item.value" />
      </el-select>
      <el-date-picker
        v-model="listQuery.value2"
        class="filter-item"
        type="datetimerange"
        :picker-options="pickerOptions"
        value-format="yyyy-MM-dd HH:mm:ss"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"
        @change="changeDate"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜搜
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
        刷新
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
      @sort-change="sortChange"
    >
      <el-table-column
        type="index"
        align="center"
        width="55"
      />

      <el-table-column label="操作" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>

      <el-table-column label="接口地址" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.path }}</span>
        </template>
      </el-table-column>

      <el-table-column label="请求方式" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.method }}</span>
        </template>
      </el-table-column>

      <el-table-column label="登录名" align="center" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column label="记录时间" align="center" width="150" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="ip" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.ip }}</span>
        </template>
      </el-table-column>

      <el-table-column label="设备名" align="center" width="110" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.deviceName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="浏览器" align="center">
        <template slot-scope="{row}">
          <span>{{ row.browserName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="执行时间" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.time }}毫秒</span>
        </template>
      </el-table-column>

      <!--      <el-table-column v-if="isAuth('sys:user:status')" label="enabled" class-name="status-col" width="120" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <el-tooltip :content="row.enabled === 0 ? '启用':'禁用'" placement="top">-->
      <!--            <el-switch-->
      <!--              v-model="row.enabled"-->
      <!--              active-color="#13ce66"-->
      <!--              inactive-color="#ff4949"-->
      <!--              :active-value="0"-->
      <!--              :inactive-value="1"-->
      <!--              @change="handleSwitch(row)"-->
      <!--            />-->
      <!--          </el-tooltip>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <!--      <el-table-column label="sex" class-name="status-col" width="55" align="center">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <el-tag :type="row.sex | statusFilter">-->
      <!--            {{ row.sex === 1 ? '男' : '女' }}-->
      <!--          </el-tag>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <!--      <el-table-column label="mobile" align="center" width="110">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span>{{ row.mobile }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <!--      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">-->
      <!--        <template slot-scope="{row,$index}">-->
      <!--          <el-button v-if="isAuth('sys:user:update')" type="primary" size="mini" @click="handleUpdate(row)">-->
      <!--            Edit-->
      <!--          </el-button>-->
      <!--          &lt;!&ndash;          <el-button v-if="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">&ndash;&gt;-->
      <!--          &lt;!&ndash;            Publish&ndash;&gt;-->
      <!--          &lt;!&ndash;          </el-button>&ndash;&gt;-->
      <!--          &lt;!&ndash;          <el-button v-if="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">&ndash;&gt;-->
      <!--          &lt;!&ndash;            Draft&ndash;&gt;-->
      <!--          &lt;!&ndash;          </el-button>&ndash;&gt;-->
      <!--          <el-button v-if="isAuth('sys:user:reset:password')" size="mini" type="danger" @click="handleRestPWD(row)">-->
      <!--            ResetPWD-->
      <!--          </el-button>-->
      <!--          <el-button v-if="isAuth('sys:user:del')" size="mini" type="danger" @click="handleDelete(row,$index)">-->
      <!--            Delete-->
      <!--          </el-button>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>
    <!--表格分页-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

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
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

/* 弹性布局 水平居中 */
.show-preview{
  display: flex;
  justify-content: center;
}

.preview{
  border-radius: 19%;
  overflow: hidden;
  border:1px solid #cccccc;
  background: #cccccc;
}
.footerBtn{
  display: flex;
  justify-content: center;
  margin-top: 15px;
}
</style>

<script>
import {
  fetchPageList
} from '@/api/log-table'

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
  name: 'Log',
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
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      // value2: '',
      tableKey: 0,
      isDisabled: false,
      // 表格字段
      roleList: [],
      list: [
        { username: '',
          path: '',
          deviceName: '',
          browserName: '',
          method: '',
          operation: '',
          time: '',
          createTime: '',
          ip: ''
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
        username: undefined,
        path: undefined,
        deviceName: undefined,
        browserName: undefined,
        method: undefined,
        value2: undefined,
        ip: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-userId' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      method: [
        { name: '登录成功', value: '登录成功' },
        { name: '登录失败', value: '登录失败' },
        { name: '查询', value: '查询' },
        { name: '更新', value: '更新' },
        { name: '删除', value: '删除' },
        { name: '添加', value: '添加' }
      ],
      enabled: [{ name: '禁用', value: 1 }, { name: '启用', value: 0 }],
      showReviewer: false,
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      betDelEnabled: false,
      pvData: [],
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    changeDate(val) {
      this.listQuery.startTime = val[0]
      this.listQuery.endTime = val[1]
    },
    // 控制弹出层关闭
    handleClose() {
      this.dialogVisible = false
    },
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
      fetchPageList(this.listQuery).then(response => {
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
      if (prop === 'userId') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+userId'
      } else {
        this.listQuery.sort = '-userId'
      }
      this.handleFilter()
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
