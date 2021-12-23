<template>
  <el-form
    ref="dataForm"
    :rules="rules"
    :model="temp"
    label-position="right"
    label-width="135px"
    style="width: 400px; margin-left:50px;"
  >
    <el-form-item label="oldPassword" prop="oldPassword">
      <el-input v-model="temp.oldPassword" type="password" />
    </el-form-item>
    <el-form-item label="newPassword" prop="newPassword">
      <el-input v-model="temp.newPassword" type="password" />
      <el-progress
        v-if="temp.newPassword !== ''"
        style="margin-top: 5px"
        :text-inside="true"
        :stroke-width="30"
        :percentage="passwordPercent"
        :format="passwordPercentFormat"
        status="success"
      />
    </el-form-item>
    <el-form-item label="confirmPassword" prop="confirmPassword">
      <el-input v-model="temp.confirmPassword" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="updatePassword">Confirm</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.el-form-item {
  width: 500px;
}
</style>
<script>
import { Notification } from 'element-ui'
import { updatePassword } from '@/api/user-table'

export default {
  data() {
    var oldPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (value.length >= 6) return callback()
        Notification.error({
          title: '温馨提示',
          message: '至少也要6位数'
        })
      }
    }
    var newPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        // 6-20位包含字符、数字和特殊字符
        var ls = 0
        if (this.temp.newPassword !== '') {
          if (this.temp.newPassword.match(/([a-z])+/)) {
            ls++
          }
          if (this.temp.newPassword.match(/([0-9])+/)) {
            ls++
          }
          if (this.temp.newPassword.match(/([A-Z])+/)) {
            ls++
          }
          if (this.temp.newPassword.match(/([\W])+/) && !this.temp.newPassword.match(/(![\u4E00-\u9FA5])+/)) {
            ls++
          }
          if (this.temp.newPassword.length < 6 || this.temp.newPassword.length > 20) {
            callback(new Error('要求6-20位字符'))
            ls = 0
          }
          if (this.temp.newPassword.match(/([\u4E00-\u9FA5])+/)) {
            callback(new Error('不能包含中文字符'))
            ls = 0
          }
          switch (ls) {
            case 0:
              this.passwordPercent = 0
              callback(new Error('数字、小写字母、大写字母以及特殊字符中四选三'))
              break
            case 1:
              this.passwordPercent = 33
              callback(new Error('数字、小写字母、大写字母以及特殊字符中四选三'))
              break
            case 2:
              this.passwordPercent = 66
              callback(new Error('数字、小写字母   、大写字母以及特殊字符中四选三'))
              break
            case 3:
            case 4:
              this.passwordPercent = 100
              break
            default:
              this.passwordPercent = 0
              break
          }
        }
        callback()
      }
    }
    var confirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.temp.confirmPassword !== this.temp.newPassword) {
          Notification.error({
            title: '温馨提示',
            message: '两次输入的密码不一致！'
          })
        }
        callback()
      }
    }

    return {
      passwordPercent: 0,
      temp: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [
          { validator: oldPassword, trigger: ['blur'], required: true }
        ],
        newPassword: [
          { validator: newPassword, trigger: ['blur', 'change'], required: true }
        ],
        confirmPassword: [
          { validator: confirmPassword, trigger: ['blur'], required: true }
        ]
      }
    }
  },
  methods: {
    updatePassword() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updatePassword(this.temp).then((res) => {
            Notification.success({
              title: '好消息',
              message: res.message
            })
            this.logout()
          })
        }
      })
    },
    passwordPercentFormat(percentage) {
      return percentage === 100 ? '很强' : (percentage <= 60 ? '弱' : '强')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>
