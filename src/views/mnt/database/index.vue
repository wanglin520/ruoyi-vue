<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="数据库名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入数据库名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['mnt:database:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['mnt:database:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['mnt:database:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['mnt:database:export']"
        >导出
        </el-button>
        <el-button
          type="warning"
          :disabled="single"
          size="mini"
          icon="el-icon-upload"
          @click="handleExecute"
          v-hasPermi="['mnt:database:execute']"
        >执行脚本
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="databaseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center"/>
      <el-table-column label="数据库名称" align="left" width="100" prop="name"/>
      <el-table-column label="连接地址" align="left" width="360" prop="jdbcUrl" :show-overflow-tooltip="true"/>
      <el-table-column label="账号" align="center" prop="userName"/>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['mnt:database:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mnt:database:remove']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改数据库管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="连接名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="jdbc地址" prop="jdbcUrl">
          <el-input v-model="form.jdbcUrl" type="textarea" placeholder="请输入jdbc地址"/>
        </el-form-item>
        <el-form-item label="账号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入账号"/>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
          <el-input type="password" v-model="form.pwd" placeholder="请输入密码" style="width: 280px"/>
          <el-button :loading="loading" type="success"
                     v-hasPermi="['mnt:database:testConnect']"
                     @click="testConnectDatabase">测试</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--执行脚本弹出框-->
    <el-dialog :visible.sync="executeOpen" :close-on-click-modal="false" title="执行脚本" width="400px">
      <el-form ref="form" :rules="rules" size="small">
        <el-upload action ref="executeUpload" :http-request="handleUpload" :limit="1" class="upload-demo" drag>
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">上传后，系统会自动执行SQL脚本</div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="executeCancel">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    listDatabase,
    getDatabase,
    delDatabase,
    addDatabase,
    updateDatabase,
    exportDatabase,
    testDbConnect,
    uploadExecute
  } from "@/api/mnt/database";

  export default {
    data() {
      return {
        // 勾选行
        selectRow: {},
        // 上传地址
        uploadUrl: '/mnt/database/upload',
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 数据库管理表格数据
        databaseList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 是否显示上传弹出框
        executeOpen: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          name: undefined,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          name: [
            {required: true, message: "名称不能为空", trigger: "blur"}
          ], jdbcUrl: [
            {required: true, message: "jdbc连接不能为空", trigger: "blur"}
          ], userName: [
            {required: true, message: "账号不能为空", trigger: "blur"}
          ], pwd: [
            {required: true, message: "密码不能为空", trigger: "blur"}
          ],
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询数据库管理列表 */
      getList() {
        this.loading = true;
        listDatabase(this.queryParams).then(response => {
          this.databaseList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          name: undefined,
          jdbcUrl: 'jdbc:mysql://',
          userName: undefined,
          pwd: undefined,
          createTime: undefined
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.selectRow = selection
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 测试数据库连接*/
      testConnectDatabase() {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.loading = true
            testDbConnect(this.form).then((res) => {
              this.loading = false
              if(res.data) {
                this.msgSuccess("连接成功");
              } else {
                this.msgError('连接失败');
              }
            });
          }
        })
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加数据库管理";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getDatabase(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改数据库管理";
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              updateDatabase(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addDatabase(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除选中的数据?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delDatabase(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有数据库管理数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportDatabase(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function () {});
      },
      /** 打开执行脚本弹出框*/
      handleExecute() {
        this.executeOpen = true;
      },
      // 取消执行脚本
      executeCancel() {
        this.executeOpen = false;
        this.$refs.executeUpload.clearFiles();
      },
      /** 自定义上传请求*/
      handleUpload(param) {
        let formData = new FormData()
        formData.append('id', this.selectRow[0].id) // 额外参数
        formData.append('file', param.file)
        uploadExecute(formData).then(response => {
          if(response.data) {
            this.msgSuccess("执行成功");
          } else {
            this.msgError("执行失败");
          }
          this.$refs.executeUpload.clearFiles();
          this.executeOpen = false;
          this.getList();
        }).catch(function () {});
      }
    }
  };
</script>
