<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边部门数据-->
      <el-col :xs="9" :sm="6" :md="4" :lg="4" :xl="4">
        <div class="head-container">
          <el-input
            v-model="departQuery.departName"
            clearable
            size="small"
            placeholder="输入部门名称搜索"
            prefix-icon="el-icon-search"
            class="filter-item"
            @input="getParentList"
          />
        </div>
        <el-tree
          :data="parentList"
          :expand-on-click-node="false"
          default-expand-all
          @node-click="departNodeClick"
        />
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="20" :lg="20" :xl="20">
        <!--搜索-->
        <div class="filter-container">
          <el-input v-model="listQuery.alias" placeholder="输入昵称或者用户名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-input v-model="listQuery.mobile" placeholder="输入手机号码" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
          <el-select v-model="listQuery.sex" placeholder="选择性别" clearable style="width: 90px" class="filter-item">
            <el-option v-for="item in sex" :key="item.name" :label="item.name" :value="item.value" />
          </el-select>
          <el-select v-model="listQuery.enabled" placeholder="选择状态" clearable style="width: 110px" class="filter-item">
            <el-option v-for="item in enabled" :key="item.name" :label="item.name" :value="item.value" />
          </el-select>
          <el-button v-if="isAuth('sys:user:search')" v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
            搜搜
          </el-button>
          <el-button v-if="isAuth('sys:user:refresh')" v-waves class="filter-item" type="primary" icon="el-icon-refresh" @click="clearFilter">
            刷新
          </el-button>
          <el-button v-if="isAuth('sys:user:save')" class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
            新增
          </el-button>
          <el-button v-if="isAuth('sys:user:export')" v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
            导出
          </el-button>
          <el-button v-if="betDelEnabled && isAuth('sys:user:btc')" v-waves class="filter-item" type="primary" icon="el-icon-delete-solid" @click="btcDelete">
            批量移除
          </el-button>
          <el-button v-waves class="filter-item" type="primary" @click="handleExplain">
            说明
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
            type="selection"
            align="center"
            width="55"
          />

          <el-table-column label="用户名" align="center" width="200">
            <template slot-scope="{row}">
              <span>{{ row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column label="昵称" align="center" width="200">
            <template slot-scope="{row}">
              <span>{{ row.alias }}</span>
            </template>
          </el-table-column>

          <el-table-column v-if="isAuth('sys:user:status')" label="状态" class-name="status-col" width="120" align="center">
            <template slot-scope="{row}">
              <el-tooltip :content="row.enabled === 0 ? '启用':'禁用'" placement="top">
                <el-switch
                  v-model="row.enabled"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                  :active-value="0"
                  :inactive-value="1"
                  @change="handleSwitch(row)"
                />
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column label="性别" class-name="status-col" width="55" align="center">
            <template slot-scope="{row}">
              <el-tag :type="row.sex | statusFilter">
                {{ row.sex === 1 ? '男' : '女' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="手机号码" align="center" width="110">
            <template slot-scope="{row}">
              <span>{{ row.mobile }}</span>
            </template>
          </el-table-column>

          <el-table-column label="部门 / 职位" align="center" width="250">
            <template slot-scope="{row}">
              <span>{{ row.departName }} / {{ row.positionName }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="{row,$index}">
              <el-button v-if="isAuth('sys:user:update')" type="primary" size="mini" @click="handleUpdate(row)">
                修改
              </el-button>
              <el-button v-if="isAuth('sys:user:reset:password')" size="mini" type="danger" @click="handleRestPWD(row)">
                重置密码
              </el-button>
              <el-button v-if="isAuth('sys:user:del')" size="mini" type="danger" @click="handleDelete(row,$index)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--表格分页-->
        <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="getList" />

        <!--表单-->
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
          <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
            <el-form-item label="avatar" prop="avatar">
              <el-upload
                ref="upload"
                class="avatar-uploader"
                action="https://jsonplaceholder.typicode.com/posts/"
                :show-file-list="false"
                :on-change="beforeAvatarUpload"
                :auto-upload="false"
              >
                <img v-if="temp.avatar" :src="temp.avatar" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
              <el-dialog
                title="编辑头像"
                :visible.sync="dialogVisible"
                :before-close="handleClose"
                append-to-body
              >
                <span>

                  <el-row>
                    <el-col :span="16">
                      <!-- 裁剪 -->
                      <vueCropper
                        ref="cropper"
                        style="width:100%;height:300px"
                        :img="attach.customaryUrl"
                        :auto-crop="options.autoCrop"
                        :fixed-box="options.fixedBox"
                        :can-move-box="options.canMoveBox"
                        :auto-crop-width="options.autoCropWidth"
                        :auto-crop-height="options.autoCropHeight"
                        :center-box="options.centerBox"
                        @realTime="realTime"
                      />
                    </el-col>
                    <el-col :span="8">
                      <h2 align="center">头像预览</h2>
                      <div class="show-preview">
                        <div :style="previews.div" class="preview">
                          <img :src="previews.url" :style="previews.img">
                        </div>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row class="footerBtn" align="center">
                    <el-button type="primary" size="small" round="" @click="cut()">确认</el-button>
                    <el-button type="primary" size="small" round="" @click="handleClose">取消</el-button>
                  </el-row>
                </span>
              </el-dialog>
            </el-form-item>
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
            <el-form-item label="sex" prop="sex">
              <el-select v-model="temp.sex" class="filter-item" placeholder="Please select">
                <el-option v-for="item in sex" :key="item.name" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="enabled" prop="enabled">
              <el-select v-model="temp.enabled" class="filter-item" placeholder="Please select">
                <el-option v-for="item in enabled" :key="item.name" :label="item.name" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="roles" prop="roles">
              <el-select
                v-model="temp.roles"
                multiple
                collapse-tags
                placeholder="请选择角色"
              >
                <el-option
                  v-for="item in roleList"
                  :key="item.id"
                  :label="item.roleName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <!--        <el-form-item label="Imp">-->
            <!--          <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />-->
            <!--        </el-form-item>-->
            <el-form-item label="职位" prop="positions">
              <el-select v-model="temp.positionId" placeholder="请选择职位">
                <el-option
                  v-for="item in positionList"
                  :key="item.positionId"
                  :label="item.positionName"
                  :value="item.positionId"
                />
              </el-select>
              <!--              <el-select-->
              <!--                v-model="temp.positions"-->
              <!--                multiple-->
              <!--                collapse-tags-->
              <!--                placeholder="请选择职位"-->
              <!--              >-->
              <!--                <el-option-->
              <!--                  v-for="item in positionList"-->
              <!--                  :key="item.positionId"-->
              <!--                  :label="item.positionName"-->
              <!--                  :value="item.positionId"-->
              <!--                />-->
              <!--              </el-select>-->
            </el-form-item>
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

        <!--说明-->
        <el-dialog
          title="说明"
          :visible.sync="explainDialogVisible"
          width="30%"
          :before-close="handleExplainClose"
        >
          <p>1.部门搜索后，不以树型结构展示</p>
          <p>2.查看用户数据，请鼠标左击左侧的部门或者公示</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="explainDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="explainDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>
      </el-col>
    </el-row>
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
  fetchList,
  fetchPv,
  createArticle,
  updateArticle,
  fetchArticle,
  fetchArticles,
  updateEnabled, updateRestPassword
} from '@/api/user-table'
import { listPosition } from '@/api/depart-position-table'
import {
  fetchParentList
} from '@/api/depart-table'
import {
  uploadFile
} from '@/api/qiniu'
import { VueCropper } from 'vue-cropper'
import {
  fetchRoleList
} from '@/api/role-table'
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
  name: 'User',
  components: { Pagination, VueCropper },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'danger'
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
          title: '温馨提示',
          message: '登录账号只允许是字母、数字组合且最大支持20个字符的username'
        })
        // callback(new Error('只允许是字母、数字组合且最大支持20个字符的username'))
      }
    }
    var avatar = (rule, value, callback) => {
      console.log(value)
      if (value === undefined) {
        Notification.error({
          title: '温馨提示',
          message: '头像还没有上传哦'
        })
      } else {
        return callback()
      }
    }
    var alias = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('alias is not null'))
      } else {
        const reg = /^[\u4E00-\u9FA5A-Za-z0-9_]{2,20}$/
        if (reg.test(value)) return callback()
        Notification.error({
          title: '温馨提示',
          message: '请输入用户别名'
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
          title: '温馨提示',
          message: '请选择性别'
        })
        // callback(new Error('只允许是字母、数字组合且最大支持20个字符的alias'))
      }
    }
    var roles = (rule, value, callback) => {
      if (value.length !== 0) return callback()
      Notification.error({
        title: '温馨提示',
        message: '请选择角色'
      })
    }
    return {
      dialogVisible: false,
      explainDialogVisible: false,
      baseUrl: process.env.VUE_APP_ADMIN_URL,
      parentList: [],
      departId: '',
      departQuery: {
        departName: '',
        departId: ''
      },
      options: {
        autoCrop: true, // 默认生成截图框
        fixedBox: true, // 固定截图框大小
        canMoveBox: false, // 截图框不能拖动
        autoCropWidth: 200, // 截图框宽度
        autoCropHeight: 200, // 截图框高度
        centerBox: false // 截图框被限制在图片里面
      },
      previews: {}, // 实时预览图数据
      attach: { // 后端附件表
        id: '',
        userId: '',
        customaryUrl: '', // 原图片路径
        laterUrl: '', // 裁剪后图片路径  /static/logo.png
        attachType: 'photo'// 附件类型
      },
      fileName: '', // 本机文件地址
      uploadImgRelaPath: '', // 上传后图片地址
      tableKey: 0,
      isDisabled: false,
      // 表格字段
      roleList: [],
      positionList: [],
      list: [
        { alias: '',
          avatar: '',
          enabled: 0,
          userId: '',
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
        departId: undefined,
        sex: undefined,
        enabled: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-userId' }],
      statusOptions: ['published', 'draft', 'deleted'],
      sex: [{ name: '男', value: 1 }, { name: '女', value: 0 }],
      enabled: [{ name: '禁用', value: 1 }, { name: '启用', value: 0 }],
      showReviewer: false,
      temp: {
        userId: undefined,
        avatar: '',
        alias: '张三',
        enabled: 0,
        departId: undefined,
        sex: 0,
        introduction: '这是一个测试账号',
        mobile: '13118854424',
        username: 'lgsh'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      betDelEnabled: false,
      pvData: [],
      rules: {
        mobile: [
          { validator: mobile, trigger: 'blur', required: true }
        ],
        username: [
          { validator: username, trigger: 'blur', required: true }
        ],
        alias: [
          { validator: alias, trigger: 'blur', required: true }
        ],
        sex: [
          { validator: sex, trigger: 'blur', required: true }
        ],
        enabled: [
          { validator: sex, trigger: 'blur', required: true }
        ],
        avatar: [
          { validator: avatar, trigger: 'blur', required: true }
        ],
        roles: [
          { validator: roles, trigger: 'blur', required: true }
        ]
      },
      downloadLoading: false
    }
  },
  created() {
    // 用户数据
    this.getList()
    // 部门数据
    this.getParentList({})
  },
  methods: {
    // 控制弹出层关闭
    handleClose() {
      this.dialogVisible = false
    },
    // 控制弹出层关闭
    handleExplainClose() {
      this.explainDialogVisible = false
    },
    departNodeClick(row) {
      console.log(row)
      this.listQuery.departId = row.id
      this.departId = row.id
      this.getList(this.listQuery)
    },
    // 父级树型数据
    getParentList() {
      fetchParentList(this.departQuery).then(response => {
        this.parentList = []
        this.parentList = response.data
        // this.parentList.push(...response.data)
      })
    },
    // 实时预览
    realTime(data) {
      this.previews = data
    },
    // 加载头像信息
    find() {
      this.userId = sessionStorage.getItem('userId')
      this.$axios.post('/api/attach/find', this.attach).then(res => {
        console.log(res)
      })
    },
    // 读取原图
    uploads(file) {
      console.log(file)
      this.fileName = file.name
      const isIMAGE = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
      const isLt3M = file.raw.size / 1024 / 1024 < 3
      if (!isIMAGE) {
        this.$message({
          showClose: true,
          message: '请选择 jpg、png 格式的图片！',
          type: 'error' // 提示类型
        })
        return false
      }
      if (!isLt3M) {
        this.$message({
          showClose: true,
          message: '上传图片大小不能超过 3MB',
          type: 'error' // 提示类型
        })
        return false
      }
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = e => {
        this.attach.customaryUrl = e.target.result
        // this.options.img = e.target.result // base64
      }
    },
    // 确认截图,上传
    cut() {
      // 获取截图的 base64 数据
      // this.$refs.cropper.getCropData((data) => {
      //   console.log(data)
      // })
      // 获取截图的 blob 数据
      this.$refs.cropper.getCropBlob((data) => {
        const frm = new FormData()
        frm.append('file', data, this.fileName)
        uploadFile(frm).then(response => {
          console.log(response)
          this.temp.avatar = response.data
          this.dialogVisible = false
        })
      })
    },
    beforeAvatarUpload(file) {
      console.log(file)
      this.fileName = file.name
      const isIMAGE = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
      const isLt3M = file.raw.size / 1024 / 1024 < 3
      if (!isIMAGE) {
        this.$message({
          showClose: true,
          message: '请选择 jpg、png 格式的图片！',
          type: 'error' // 提示类型
        })
        return false
      }
      if (!isLt3M) {
        this.$message({
          showClose: true,
          message: '上传图片大小不能超过 3MB',
          type: 'error' // 提示类型
        })
        return false
      }
      const reader = new FileReader()
      reader.readAsDataURL(file.raw)
      reader.onload = e => {
        this.attach.customaryUrl = e.target.result
        // this.options.img = e.target.result // base64
      }
      this.dialogVisible = true
    },
    handleSwitch(row) {
      console.log(row)
      const data = {
        enabled: row.enabled,
        userId: row.userId
      }
      updateEnabled(data).then(() => {
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
      console.log(this.betDelEnabled)
    },
    handleSelectAll(val) {
      this.betDelEnabled = val.length > 0
      console.log(this.betDelEnabled)
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
    getRoleList() {
      this.listLoading = true
      fetchRoleList().then(response => {
        console.log(response)
        this.roleList = response.data
        // this.temp.roles[0] = this.roleList.length > 0 ? this.roleList[0] : []
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        })
      })
    },
    getPositionList() {
      this.listLoading = true
      listPosition(this.departId).then(response => {
        this.positionList = response.data
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
    resetTemp() {
      this.temp = {
        userId: undefined,
        avatar: '',
        alias: '王五1',
        enabled: 0,
        departId: '',
        sex: 0,
        introduction: '这是一个测试账号',
        mobile: '13118854424',
        username: 'wangwu1'
      }
      // 显示表单提示按钮
      this.isDisabled = false
    },
    // 新增弹窗拦截
    handleCreate() {
      // 没有点击部门不允许弹出新增表单
      if (this.departId === null || this.departId === '') {
        this.$notify({
          title: '温馨提示',
          message: '请鼠标左击左侧的部门或公司后再进行添加操作',
          type: 'warning',
          duration: 5000
        })
        return
      }
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.getRoleList()
      this.getPositionList()
      // 清除表单字段数据
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleExplain() {
      this.explainDialogVisible = true
    },
    btcDelete() {
      const dd = this.$refs.multipleTable.selection
      let ids = ''
      for (const ddElement of dd) {
        ids += ',' + ddElement.userId
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
          // this.temp.author = 'http://localhost:8080/cn/images/2021/10/26/f778738c-e4f8-4870-b634-56703b4acafe.gif'
          this.temp.departId = this.departId
          createArticle(this.temp).then((res) => {
            if (res.code === 20000) {
              this.isDisabled = true
            }
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
      this.isDisabled = false
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.getRoleList()
      this.getPositionList()
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            // const index = this.list.findIndex(v => v.userId === this.temp.userId)
            // this.list.splice(index, 1, this.temp)
            this.getList()
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
      fetchArticle(row.userId).then((res) => {
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
    handleRestPWD(row) {
      const data = {
        userId: row.userId
      }
      updateRestPassword(data).then((res) => {
        Notification({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
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
