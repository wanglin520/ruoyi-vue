<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="任务名称" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="请输入任务名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="执行状态" prop="isSuccess">
        <el-select v-model="queryParams.isSuccess" placeholder="请选择执行状态" clearable size="small">
          <el-option
            v-for="dict in resultOptions"
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
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['job:log:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          @click="handleEmpty"
          v-hasPermi="['job:log:remove']"
        >清空
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['job:log:export']"
        >导出
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="logList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center"/>
      <el-table-column label="任务名称" align="left" width="150" prop="jobName"/>
      <el-table-column label="Bean名称" align="center" prop="beanName"/>
      <el-table-column label="执行方法" align="left" prop="methodName" :show-overflow-tooltip="true"/>
      <el-table-column label="参数" align="left" prop="jobParams" :show-overflow-tooltip="true"/>
      <el-table-column label="cron表达式" align="center" prop="cronExpression"/>
      <el-table-column label="异常详情" align="left" prop="exceptionDetail" :show-overflow-tooltip="true"/>
      <el-table-column label="耗时(毫秒)" align="center" prop="time"/>
      <el-table-column label="状态" align="center" prop="isSuccess">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isSuccess == '0' ? 'success' : 'danger'">{{ scope.row.isSuccess == "0" ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="150" prop="createTime"/>
      <el-table-column label="操作" align="center" width="120" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleDetail(scope.row)"
            v-hasPermi="['job:log:query']"
          >详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['job:log:remove']"
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

    <!-- 调度日志详情对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="120px">
        <el-form-item label="日志编号" prop="id">
          <el-input v-model="form.id" :disabled="true"/>
        </el-form-item>
        <el-form-item label="任务名称" prop="jobName">
          <el-input v-model="form.jobName" :disabled="true"/>
        </el-form-item>
        <el-form-item label="Bean名称" prop="beanName">
          <el-input v-model="form.beanName" :disabled="true"/>
        </el-form-item>
        <el-form-item label="执行方法" prop="methodName">
          <el-input v-model="form.methodName" :disabled="true"/>
        </el-form-item>
        <el-form-item label="参数" prop="jobParams">
          <el-input v-model="form.jobParams" :disabled="true"/>
        </el-form-item>
        <el-form-item label="cron表达式" prop="cronExpression">
          <el-input v-model="form.cronExpression" :disabled="true"/>
        </el-form-item>
        <el-form-item label="异常详情" prop="exceptionDetail">
          <el-input v-model="form.exceptionDetail" type="textarea" :disabled="true"/>
        </el-form-item>
        <el-form-item label="执行状态">
          <el-radio-group v-model="form.isSuccess" disabled>
            <el-radio
              v-for="dict in resultOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{dict.dictLabel}}
            </el-radio>
          </el-radio-group>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listLog, getLog, delLog, cleanLog, exportLog} from "@/api/tool/joblog";

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
        // 定时任务调度日志表格数据
        logList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 执行状态
        resultOptions: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          jobName: undefined,
          isSuccess: undefined
        },
        // 表单参数
        form: {}
      };
    },
    created() {
      this.getList();
      this.getDicts("sys_common_status").then(response => {
        this.resultOptions = response.data;
      });
    },
    methods: {
      /** 查询定时任务调度日志列表 */
      getList() {
        this.loading = true;
        listLog(this.queryParams).then(response => {
          this.logList = response.rows;
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
          jobName: undefined,
          beanName: undefined,
          methodName: undefined,
          jobParams: undefined,
          cronExpression: undefined,
          exceptionDetail: undefined,
          isSuccess: '0'
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
      /** 详情按钮操作 */
      handleDetail(row) {
        this.reset();
        const id = row.id
        getLog(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "调度日志详情";
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const jobLogIds = row.id || this.ids;
        this.$confirm('是否确认删除定时任务调度日志编号为"' + jobLogIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delLog(jobLogIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 清空按钮操作*/
      handleEmpty() {
        this.$confirm('是否确认清空定时任务调度日志?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return cleanLog();
        }).then(() => {
          this.getList();
          this.msgSuccess("清空成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有定时任务调度日志数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportLog(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function () {
        });
      }
    }
  };
</script>
