<template>
  <body id="poster">
    <el-form
      ref="loginForm"
      class="login-container"
      label-position="left"
      label-width="0px"
      :model="loginForm"
      :rules="dataRule"
      status-icon
      @keyup.enter.native="dataFormSubmit()"
    >
      <h3 class="login_title">系统登录</h3>
      <el-form-item prop="username">
        <el-input
          ref="username"
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          ref="password"
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
        />
      </el-form-item>

      <el-form-item style="width: 100%">
        <el-button type="primary" style="width: 100%;background: #505458;border: none" @click="dataFormSubmit()">登录</el-button>
      </el-form-item>
    </el-form>
  </body>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      dataRule: {
        username: [
          { required: true, message: '帐号不能为空', trigger: 'change' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ]
      },
      captchaPath: ''
    }
  },
  mounted() {
    if (getToken() !== null || getToken() !== undefined || getToken() !== '') {
      this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
    }
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    // 提交表单
    dataFormSubmit() {
      this.$refs['loginForm'].validate((valid) => {
        console.log(valid)
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then((res) => {
              this.$router.push({ path: '/', query: this.otherQuery })
              // this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style>
#poster {
  background: url(~@/assets/img/login-bg.gif) no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;
  background-size: cover;
  position: fixed;
}

body {
  margin: 0px;
  padding: 0;
}

.login-container {
  border-radius: 15px;
  background-clip: padding-box;
  margin: 90px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}

.login_title {
  margin: 0px auto 40px auto;
  text-align: center;
  color: #505458;
}

</style>
