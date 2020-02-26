<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="应用名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入应用名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="应用端口" prop="port">
        <el-input
          v-model="queryParams.port"
          placeholder="请输入应用端口"
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
          v-hasPermi="['mnt:app:add']"
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
          v-hasPermi="['mnt:app:edit']"
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
          v-hasPermi="['mnt:app:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['mnt:app:export']"
        >导出
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="appList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center"/>
      <el-table-column label="应用名称" width="200" align="left" prop="name"/>
      <el-table-column label="端口" align="center" width="60" prop="port"/>
      <el-table-column label="上传目录" align="left" prop="uploadPath"/>
      <el-table-column label="部署路径" align="left" prop="deployPath"/>
      <el-table-column label="备份路径" align="left" prop="backupPath"/>
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
            v-hasPermi="['mnt:app:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mnt:app:remove']"
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

    <!-- 添加或修改应用管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入应用名称"/>
        </el-form-item>
        <el-form-item label="应用端口" prop="port">
          <el-input-number v-model="form.port" placeholder="例如：8080"/>
        </el-form-item>
        <el-form-item label="上传目录" prop="uploadPath">
          <el-input v-model="form.uploadPath" placeholder="请输入上传目录, 例如: /opt/upload"/>
        </el-form-item>
        <el-form-item label="部署路径" prop="deployPath">
          <el-input v-model="form.deployPath" placeholder="请输入部署路径, 例如: /opt/app"/>
        </el-form-item>
        <el-form-item label="备份路径" prop="backupPath">
          <el-input v-model="form.backupPath" placeholder="请输入备份路径, 例如: /opt/backup"/>
        </el-form-item>
        <el-form-item label="部署脚本" prop="deployScript">
          <el-input v-model="form.deployScript" type="textarea" autosize placeholder="请输入内容"/>
        </el-form-item>
        <el-form-item label="启动脚本" prop="startScript">
          <el-input v-model="form.startScript" type="textarea" autosize placeholder="请输入内容"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listApp, getApp, delApp, addApp, updateApp, exportApp} from "@/api/mnt/app";

  export default {
    data() {
      return {
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
        // 应用管理表格数据
        appList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          name: undefined,
          port: undefined,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          name: [
            { required: true, message: '请输入应用名称', trigger: 'blur' }
          ],
          port: [
            { required: true, message: '请输入应用端口', trigger: 'blur', type: 'number' }
          ],
          uploadPath: [
            { required: true, message: '请输入上传目录', trigger: 'blur' }
          ],
          deployPath: [
            { required: true, message: '请输入部署目录', trigger: 'blur' }
          ],
          backupPath: [
            { required: true, message: '请输入备份目录', trigger: 'blur' }
          ],
          startScript: [
            { required: true, message: '请输入启动脚本', trigger: 'blur' }
          ],
          deployScript: [
            { required: true, message: '请输入部署脚本', trigger: 'blur' }
          ]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询应用管理列表 */
      getList() {
        this.loading = true;
        listApp(this.queryParams).then(response => {
          this.appList = response.rows;
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
          id: null,
          name: null,
          port: 8080,
          uploadPath: '/opt/upload',
          deployPath: '/opt/ruoyi',
          backupPath: '/opt/backup',
          startScript: null,
          deployScript: null
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
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加应用管理";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getApp(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改应用管理";
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              this.form.startScript = encodeURIComponent(this.form.startScript);
              this.form.deployScript = encodeURIComponent(this.form.deployScript);
              updateApp(this.form).then(response => {
                if (response.code === 200) {
                  this.open = false;
                  this.msgSuccess("修改成功");
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              }).catch(function () {});
            } else {
              addApp(this.form).then(response => {
                if (response.code === 200) {
                  this.open = false;
                  this.msgSuccess("新增成功");
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              }).catch(function () {});
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
          return delApp(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有应用管理数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportApp(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function () {
        });
      }
    }
  };
</script>
