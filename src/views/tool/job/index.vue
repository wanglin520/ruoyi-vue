<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="任务名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"></el-input>
      </el-form-item>
      <el-form-item label="任务状态" prop="isPause">
        <el-select v-model="queryParams.isPause" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          ></el-option>
        </el-select>
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
          v-hasPermi="['tool:job:add']"
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
          v-hasPermi="['tool:job:edit']"
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
          v-hasPermi="['tool:job:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['tool:job:export']"
        >导出
        </el-button>
        <router-link to='/joblog/index' class="link-type">
          <el-button
            type="info"
            icon="el-icon-s-data"
            size="mini"
          >日志
          </el-button>
        </router-link>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"></el-table-column>
      <el-table-column label="任务名称" align="left" prop="jobName" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="Bean名称" align="left" prop="beanName"></el-table-column>
      <el-table-column label="执行方法" align="left" prop="methodName" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="参数" align="center" prop="jobParams"></el-table-column>
      <el-table-column label="cron表达式" align="center" width="110" prop="cronExpression"></el-table-column>
      <el-table-column label="任务状态" align="center" prop="isPause">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isPause === '1' ? 'warning' : 'success'">{{ scope.row.isPause === '1' ? '暂停' : '正常' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="left" prop="remark" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['tool:job:edit']"
          >编辑
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-play"
            @click="handleRun(scope.row)"
            v-hasPermi="['tool:job:edit']"
          >执行
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-video-play"
            @click="handleStatusChange(scope.row.id,scope.row.isPause === '1' ? '0' : '1')"
            v-hasPermi="['tool:job:edit']"
          >{{ scope.row.isPause === '1' ? '恢复' : '暂停' }}
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['tool:job:remove']"
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

    <!-- 添加或修改定时任务调度对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务名称" prop="jobName">
          <el-input v-model="form.jobName" placeholder="请输入任务名称"/>
        </el-form-item>
        <el-form-item label="Bean名称" prop="beanName">
          <el-input v-model="form.beanName" placeholder="请输入Bean名称"/>
        </el-form-item>
        <el-form-item label="执行方法" prop="methodName">
          <el-input v-model="form.methodName" placeholder="请输入执行方法"/>
        </el-form-item>
        <el-form-item label="参数内容">
          <el-input v-model="form.jobParams" placeholder="请输入参数内容"/>
        </el-form-item>
        <el-form-item label="cron表达式" prop="cronExpression">
          <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
            <el-button type="primary" slot="append" @click="hanldCronUrl">在线生成</el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-radio-group v-model="form.isPause">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="任务描述" prop="remark">
          <el-input v-model="form.remark" type="textarea"/>
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
  import {listJob, getJob, delJob, addJob, updateJob, exportJob, updateJobStatus, checkCronExpressionIsValid, runJob} from "@/api/tool/job";

  export default {
    data() {
      // 校验Cron表达式
      var validateCron = (rule, value, callback) => {
        checkCronExpressionIsValid(value).then(response => {
          if(response.data) {
            callback();
          } else {
            return callback(new Error('cron表达式不正确!'));
          }
        });
      }
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
        // 定时任务调度表格数据
        jobList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 状态下拉选
        statusOptions: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          jobName: undefined,
          isPause: undefined,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          jobName: [
            {required: true, message: "任务名称不能为空", trigger: "blur"}
          ],
          beanName: [
            { required: true, message: '请输入Bean名称', trigger: 'blur' }
          ],
          methodName: [
            { required: true, message: '请输入方法名称', trigger: 'blur' }
          ],
          cronExpression: [
            {required: true, message: "cron表达式不能为空!", trigger: "blur"},
            {validator: validateCron, trigger: 'blur'}
          ],
        }
      };
    },
    created() {
      this.getList();
      this.getDicts("sys_job_status").then(response => {
        this.statusOptions = response.data;
      });
    },
    methods: {
      /** 查询定时任务调度列表 */
      getList() {
        this.loading = true;
        listJob(this.queryParams).then(response => {
          this.jobList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      /** 跳转到cron在线生成页面*/
      hanldCronUrl() {
        window.open('http://cron.qqe2.com', '_blank');
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
          jobName: undefined,
          beanName: undefined,
          methodName: undefined,
          jobParams: undefined,
          cronExpression: undefined,
          isPause: '0',
          remark: undefined
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
        this.ids = selection.map(item => item.jobId)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加定时任务调度";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const jobId = row.id || this.ids
        getJob(jobId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改定时任务调度";
        });
      },
      /** 执行任务*/
      handleRun(row) {
        const id = row.id;
        const jobName = row.jobName;
        this.$confirm('是否执行 ' + jobName + '?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return runJob(id);
        }).then(() => {
          this.getList();
          this.msgSuccess("执行成功");
        }).catch(function () {
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              updateJob(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addJob(this.form).then(response => {
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
        const jobIds = row.id || this.ids;
        this.$confirm('是否确认删除定时任务调度编号为"' + jobIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delJob(jobIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有定时任务调度数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportJob(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function () {
        });
      },
      /** 修改任务状态*/
      handleStatusChange(id, isPause) {
        let text = isPause === '0' ? "恢复" : "暂停";
        this.$confirm('确认要' + text + '定时任务吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return updateJobStatus(id, isPause);
        }).then(() => {
          this.getList();
          this.msgSuccess(text + "成功");
        });
      }
    }
  };
</script>
