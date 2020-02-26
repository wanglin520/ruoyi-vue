<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="应用" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="请选择应用">
          <el-option v-for="item in apps" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务器" prop="serverId">
        <el-select v-model="queryParams.serverId" placeholder="请选择服务器">
          <el-option v-for="item in servers" :key="item.id" :label="item.name" :value="item.id" />
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
          v-hasPermi="['mnt:deploy:add']"
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
          v-hasPermi="['mnt:deploy:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['mnt:deploy:export']"
        >导出
        </el-button>
        <el-button
          v-hasPermi="['mnt:deploy:add']"
          :disabled="single"
          class="filter-item"
          size="mini"
          type="primary"
          @click="handleSysRestore"
        ><svg-icon icon-class="restore"/>系统还原
        </el-button>
        <el-button
          v-hasPermi="['mnt:deploy:add']"
          :disabled="single"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-search"
          @click="handleServerStatus"
        >状态查询
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="deployList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="应用名称" align="left" prop="sysApp.name"/>
      <el-table-column label="服务器" align="left" prop="sysServer.name"/>
      <el-table-column label="应用状态" align="center" width="80" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '1' ? 'warning' : 'success'">
            {{ scope.row.status === '1' ? '停止' : '启动' }}
          </el-tag>
        </template>
      </el-table-column>
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
            v-hasPermi="['mnt:deploy:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['mnt:deploy:remove']"
          >删除
          </el-button>
          <el-button
            v-if="scope.row.status == '1'"
            v-hasPermi="['mnt:deploy:start']"
            size="mini"
            type="text"
            @click="handleStartServer(scope.row)"
          ><svg-icon icon-class="start"/>启动
          </el-button>
          <el-button
            v-if="scope.row.status == '0'"
            v-hasPermi="['mnt:deploy:stop']"
            size="mini"
            type="text"
            @click="handleStopServer(scope.row)"
          ><svg-icon icon-class="stop"/>停止
          </el-button>
          <el-button
            v-hasPermi="['mnt:deploy:add']"
            size="mini"
            type="text"
            icon="el-icon-upload"
            @click="handleDeploy(scope.row)"
          >一键部署
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

    <!-- 添加或修改部署管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="应用" prop="appId">
          <el-select v-model="form.appId" placeholder="请选择应用" style="width: 350px">
            <el-option v-for="item in apps" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务器" prop="serverId">
          <el-select v-model="form.serverId" placeholder="请选择服务器" style="width: 350px">
            <el-option v-for="item in servers" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--系统还原弹出框-->
    <el-dialog title="系统还原" :visible.sync="restoreOpen" width="800px" :close-on-click-modal="false">
      <el-table v-loading="loading" :data="restoreList" style="width: 100%" @row-click="showRestoreRow">
        <el-table-column width="30px">
          <template slot-scope="scope">
            <el-radio v-model="radio" :label="scope.row" />
          </template>
        </el-table-column>
        <el-table-column prop="appName" label="应用名称" />
        <el-table-column prop="ip" label="部署IP" />
        <el-table-column prop="deployDate" label="部署时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.deployDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deployUser" label="部署人员" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button v-hasPermi="['mnt:deploy:add']" type="primary" @click="restoreSubmit">确认</el-button>
        <el-button @click="restoreCancel">取消</el-button>
      </div>
      <!--分页组件-->
      <pagination
        v-show="restoreTotal>0"
        :total="restoreTotal"
        :page.sync="queryRestoreParams.pageNum"
        :limit.sync="queryRestoreParams.pageSize"
        @pagination="getList"
      />
    </el-dialog>

    <!--一键部署弹出框-->
    <el-dialog :visible.sync="deployOpen" :close-on-click-modal="false" title="应用部署" width="400px">
      <el-form ref="form" :rules="rules" size="small">
        <el-upload ref="deployUpload" action :http-request="handleUpload" :limit="1" class="upload-demo" drag>
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或
            <em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">上传后，系统会自动部署系统</div>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deployCancel">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listDeploy, getDeploy, delDeploy, addDeploy, updateDeploy, exportDeploy, startDeployServer, stopDeployServer, uploadDeploy, restore} from "@/api/mnt/deploy";
  import {queryServerSelect} from "@/api/mnt/server";
  import {queryAppSelect} from "@/api/mnt/app";
  import {listHistory} from "@/api/mnt/deployHistory";
  import {validateIP, isEmptyObject} from "@/utils/validate";

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
        // 部署管理总条数
        total: 0,
        // 系统还原总条数
        restoreTotal: 0,
        // 部署管理表格数据
        deployList: [],
        // 系统还原表格数据
        restoreList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 是否显示一键部署弹出层
        deployOpen: false,
        // 系统还原弹出层
        restoreOpen: false,
        // 服务器下拉选
        servers: [],
        // 应用下拉选
        apps: [],
        // 当前操作行的id
        currentId: undefined,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          appId: undefined,
          serverId: undefined
        },
        // 系统还原查询参数
        queryRestoreParams: {
          pageNum: 1,
          pageSize: 10,
          deployId: null
        },
        // 系统还原列表radio
        radio: '',
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          appId: [
            { required: true, message: '应用不能为空', trigger: 'blur' }
          ],
          serverId: [
            { required: true, message: '服务器不能为空', trigger: 'blur' }
          ]
        }
      };
    },
    created() {
      this.getList();
    },
    mounted() {
      this.getServerSelect();
      this.getAppSelect();
    },
    methods: {
      /** 查询部署管理列表 */
      getList() {
        this.loading = true;
        listDeploy(this.queryParams).then(response => {
          this.deployList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      /** 查询服务器下拉选*/
      getServerSelect() {
        queryServerSelect().then(response => {
          this.servers = response.data;
        });
      },
      /** 查询应用下拉选*/
      getAppSelect() {
        queryAppSelect().then(response => {
          this.apps = response.data;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      restoreCancel() {
        this.restoreOpen = false;
      },
      deployCancel() {
        this.deployOpen = false;
        this.$refs.deployUpload.clearFiles();
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          appId: undefined,
          serverId: undefined,
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
      // 部署管理列表多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      // 系统还原列表行点击事件
      showRestoreRow(row) {
        this.radio = this.row;
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加部署";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getDeploy(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改部署";
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              updateDeploy(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addDeploy(this.form).then(response => {
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
        let msg = '';
        const id = row.id;
        const status = row.status;
        if(status === '0') {
          msg = '该应用正在运行, 删除会停止该应用! 是否确认删除该应用?';
        } else {
          msg = '是否确认删除选中的部署应用?';
        }
        this.$confirm(msg, "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delDeploy(id);
        }).then((res) => {
          if(res.code == 200) {
            this.getList();
            this.msgSuccess(res.msg);
          } else {
            this.msgError(res.msg);
          }

        }).catch(function() {});
      },
      /** 启动服务*/
      handleStartServer(row) {
        this.$confirm('是否确认启动该服务?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return startDeployServer(row);
        }).then(response => {
          if (response.code === 200) {
            this.getList();
            this.msgNotify(200, response.msg);
          } else {
            this.msgNotify(100, response.msg);
          }
        }).catch(function() {});
      },
      /** 停止服务*/
      handleStopServer(row) {
        this.$confirm('是否确认停止该服务?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return stopDeployServer(row);
        }).then((response) => {
          if(response.code === 200) {
            this.getList();
            this.msgNotify(200, response.msg);
          } else {
            this.msgNotify(100, response.msg);
          }
        }).catch(function() {});
      },
      /** 一键部署*/
      handleDeploy(row) {
        this.deployOpen = true;
        this.currentId = row.id;
      },
      // 自定义上传
      handleUpload(param) {
        let formData = new FormData()
        formData.append('id', this.currentId) // 额外参数
        formData.append('file', param.file)
        uploadDeploy(formData).then(response => {
          if(response.data) {
            this.msgSuccess("启动成功");
          } else {
            this.msgError("启动失败");
          }
          this.$refs.deployUpload.clearFiles();
          this.deployOpen = false;
          this.getList();
        }).catch(function() {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有部署管理数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportDeploy(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function() {});
      },
      /** 系统还原*/
      handleSysRestore() {
        this.queryRestoreParams.deployId = this.ids[0];
        this.loading = true;
        this.restoreOpen = true;
        listHistory(this.queryRestoreParams).then(response => {
          this.restoreList = response.rows;
          this.restoreTotal = response.total;
          this.loading = false;
        });
      },
      /** 系统还原弹出框确认*/
      restoreSubmit() {
        if(!isEmptyObject(this.radio)) {
          this.msgNotify(100, '请选择要还原的备份');
        } else {
          restore(this.radio).then(response => {

          }).catch(function () {});
        }
      },
      /** 状态查询*/
      handleServerStatus() {

      }
    }
  };
</script>
