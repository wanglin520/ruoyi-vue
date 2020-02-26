<template>
  <div class="app-container">
    <el-card>
      <el-tabs :animated="false" @on-click="handleClickTab">
        <el-tab-pane label="Redis管理">
          <el-form :model="queryParams" ref="queryForm" :inline="true">
            <el-form-item prop="key">
              <el-input type="text" v-model="queryParams.key" size="small" placeholder="请输入Key" clearable style="width: 200px"/>
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
                v-hasPermi="['monitor:redis:add']"
              >新增</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="handleClear"
                v-hasPermi="['monitor:redis:remove']"
              >清空所有</el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                type="error"
                icon="el-icon-delete"
                size="mini"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['monitor:redis:remove']"
              >批量删除</el-button>
            </el-col>
          </el-row>
          <el-table v-loading="loading" :data="redisList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="Key" align="left" prop="key" />
            <el-table-column label="Value" align="left" :show-overflow-tooltip="true"  prop="value"/>
            <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleEdit(scope.row)"
                  v-hasPermi="['monitor:redis:edit']"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleDelete(scope.row)"
                  v-hasPermi="['monitor:redis:delete']"
                >删除</el-button>
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
        </el-tab-pane>
        <el-tab-pane name="monitor" label="Redis监控">
          <redis-monitor />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 新增或编辑Redis弹出框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="70px" :rules="rules">
        <el-form-item label="Key" prop="key">
          <el-input v-model="form.key"/>
        </el-form-item>
        <el-form-item label="Value" prop="value">
          <el-input v-model="form.value" type="textarea" :rows="3"/>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {getRedisData, saveRedis, deleteRedis, deleteAllRedis, getRedisByKey} from "@/api/monitor/redis";
  import redisMonitor from "./redisMonitor.vue";
  export default {
    name: "Redis",
    components: {
      redisMonitor
    },
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        keys: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // Redis表格数据
        redisList: null,
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          key: undefined
        },
        // 表单参数
        form: {},
        // 表单验证规则
        rules: {
          key: [{ required: true, message: "Key不能为空", trigger: "blur" }],
          value: [{ required: true, message: "Value不能为空", trigger: "blur" }]
        }
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 获取redis列表数据*/
      getList() {
        this.loading = true;
        getRedisData(this.queryParams).then(response => {
          this.redisList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.keys = selection.map(item => item.key);
        this.single = selection.length != 1;
        this.multiple = !selection.length;
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
      // 表单重置
      reset() {
        this.form = {
          key: undefined,
          value: undefined,
        };
        this.resetForm("form");
      },
      /** 刷新Redis监控*/
      handleClickTab(name) {
        if (name == "monitor") {
          this.$Message.info("每隔5秒刷新一次数据，请耐心等待图表绘制");
        }
      },
      // 新增
      handleAdd() {
        this.title = "添加";
        this.reset();
        this.open = true;
      },
      // 编辑
      handleEdit(row) {
        this.reset();
        const key = row.key;
        this.form.key = key;
        this.form.value = "读取中...";
        getRedisByKey(key).then(res => {
          this.form.value = res.msg;
          this.title = "编辑";
          this.open = true;
        });

      },
      /** 提交按钮 */
      handleSubmit() {
        this.$refs.form.validate(valid => {
          if (valid) {
            // 添加或编辑
            saveRedis(this.form).then(res => {
              if (res.code === 200) {
                this.msgSuccess("操作成功");
                this.getList();
                this.open = false;
              }
            });
          }
        });
      },
      /** 清空按钮操作*/
      handleClear() {
        this.$confirm('您确认要彻底清空删除所有数据?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteAllRedis();
        }).then(response => {
          this.getList();
          this.msgSuccess("清空成功");
        }).catch(function() {});
      },
      /** 批量删除按钮操作*/
      handleDelete(row) {
        const keys = row.key || this.keys;
        this.$confirm('是否确认删除选择的数据项吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteRedis(keys);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      }
    }
  };
</script>
<style lang="less">

</style>
