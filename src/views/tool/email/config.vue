<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="rules" style="margin-top: 6px;" size="small" label-width="100px">
      <el-form-item label="发件人邮箱" prop="fromUser">
        <el-input v-model="form.fromUser" style="width: 40%" placeholder="请输入发件人邮箱"/>
      </el-form-item>
      <el-form-item label="发件用户名" prop="username">
        <el-input v-model="form.username" style="width: 40%;" placeholder="请输入发件用户名"/>
      </el-form-item>
      <el-form-item label="邮箱密码" prop="password">
        <el-input v-model="form.password" type="password" style="width: 40%;" placeholder="请输入邮箱密码"/>
      </el-form-item>
      <el-form-item label="SMTP地址" prop="host">
        <el-input v-model="form.host" style="width: 40%;" placeholder="请输入SMTP地址"/>
      </el-form-item>
      <el-form-item label="SMTP端口" prop="port">
        <el-input v-model="form.port" style="width: 40%;" placeholder="请输入SMTP端口"/>
      </el-form-item>
      <el-form-item label="">
        <el-button :loading="loading" size="medium" type="primary" @click="doSubmit">保存配置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { getEmailConfig, updateOrAddConfig } from '@/api/tool/email'
  export default {
    name: 'Config',
    data() {
      return {
        loading: false,
        form: {
          id: undefined,
          fromUser: undefined,
          username: undefined,
          password: undefined,
          host: 'smtp.163.com',
          port: '465'
        },
        rules: {
          fromUser: [
            { required: true, message: '请输入发件人邮箱', trigger: 'blur' },
            { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
          ],
          username: [
            { required: true, message: '请输入发件用户名', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '密码不能为空', trigger: 'blur' }
          ],
          host: [
            { required: true, message: 'SMTP地址不能为空', trigger: 'blur' }
          ],
          port: [
            { required: true, message: 'SMTP端口不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {
        getEmailConfig().then(res => {
          if(res.data != null) {
            this.form = res.data;
          }
        })
      },
      doSubmit() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.loading = true
            updateOrAddConfig(this.form).then(res => {
              this.$notify({
                title: '修改成功',
                type: 'success',
                duration: 2500
              })
              this.loading = false
            }).catch(err => {
              this.loading = false
              console.log(err.response.data.message)
            })
          } else {
            return false
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>

