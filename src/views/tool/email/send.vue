<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card :body-style="{height: '600px'}" shadow="never">
          <div style="text-align: center; height: 70px;">
            <el-button type="primary" style="width: 98%" @click="handleWrite">写信</el-button>
          </div>
          <div class="ad">
            <a @click="handleList('收件箱', 1)">
              <span>收件箱</span>
              <span class="email_label first">{{ count.scount }}</span>
            </a>
            <el-divider></el-divider>
            <a @click="handleList('发件箱', 2)">
              <span>发件箱</span>
              <span class="email_label first">{{ count.fcount }}</span>
            </a>
            <el-divider></el-divider>
            <a @click="handleList('草稿箱', 3)">
              <span>草稿箱</span>
              <span class="email_label second">{{ count.ccount }}</span>
            </a>
            <el-divider></el-divider>
            <a @click="handleList('垃圾箱', 4)">
              <span>垃圾箱</span>
              <span class="email_label second">{{ count.lcount }}</span>
            </a>
            <el-divider></el-divider>
          </div>
        </el-card>
      </el-col>
      <!-- 写信 -->
      <el-col :span="18" :xs="24" v-if="isShowForm">
        <el-card shadow="never">
          <el-form ref="form" :model="form" :rules="rules" style="margin-top: 6px;" size="small" label-width="100px">
            <el-form-item label="收件人">
              <span class="tag-group el-tag-div">
                <el-tag size="small" :key="tag" v-for="tag in form.names">{{tag}}</el-tag>
              </span>
              <el-button type="primary" style="width: 70px;" @click="handleSelectTos">选择</el-button>
            </el-form-item>
            <el-form-item label="标题" prop="subject">
              <el-input v-model="form.subject" style="width: 685px" />
            </el-form-item>
            <el-form-item label="内容" prop="content">
              <Editor v-model="form.content" />
            </el-form-item>
            <!--<el-form-item label="附件" style="margin-top: 100px">
              <el-upload
                class="upload-demo"
                ref="upload"
                action=""
                :on-exceed="handleExceed"
                :before-remove="handleBeforeRemove"
                :file-list="fileList"
                :auto-upload="false">
                <el-button slot="trigger" size="small" icon="el-icon-upload2">上传</el-button>
              </el-upload>
            </el-form-item>-->
            <el-form-item style="margin-left: 60%; margin-top: 100px;">
              <el-button size="medium" type="primary" v-hasPermi="['tool:email:send']" @click="handleSendEmail">发送邮件</el-button>
              <el-button size="medium" v-hasPermi="['tool:email:draft']" @click="handleSaveDraft">存为草稿</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <!--收件人列表弹出框-->
      <el-dialog title="选择收件人" :visible.sync="open" width="900px" :close-on-click-modal="false">
        <el-row :gutter="20">
          <!--部门数据-->
          <el-col :span="6" :xs="24">
            <el-card shadow="never">
              <div class="head-container">
                <el-input
                  v-model="deptName"
                  placeholder="请输入部门名称"
                  clearable
                  size="small"
                  prefix-icon="el-icon-search"
                  style="margin-bottom: 20px"
                />
              </div>
              <div class="head-container">
                <el-tree
                  :data="deptOptions"
                  :props="defaultProps"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  ref="tree"
                  default-expand-all
                  @node-click="handleNodeClick"
                />
              </div>
            </el-card>
          </el-col>
          <!--用户数据-->
          <el-col :span="18" :xs="24">
            <el-card shadow="never">
              <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
                <el-form-item label="用户账号" prop="userName">
                  <el-input
                    v-model="queryParams.userName"
                    placeholder="请输入用户账号"
                    clearable
                    size="small"
                    style="width: 200px"
                    @keyup.enter.native="handleQuery"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
                </el-form-item>
              </el-form>
              <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50" align="center"/>
                <el-table-column label="编号" align="center" width="50" prop="userId" />
                <el-table-column label="用户账号" align="left" width="80" prop="userName" :show-overflow-tooltip="true" />
                <el-table-column label="用户姓名" align="left" width="80" prop="nickName" :show-overflow-tooltip="true" />
                <el-table-column label="手机号码" align="center" prop="phonenumber" width="110" />
                <el-table-column label="邮箱" align="left" prop="email" :show-overflow-tooltip="true" />
              </el-table>
              <pagination
                v-show="total>0"
                :total="total"
                :page.sync="queryParams.pageNum"
                :limit.sync="queryParams.pageSize"
                @pagination="getUserList"
              />
            </el-card>
          </el-col>
        </el-row>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="confirmSelect">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>

      <!--邮箱列表-->
      <el-col :span="18" :xs="24" v-if="isShowList">
        <el-card shadow="never" :body-style="{height: '600px'}">
          <div class="el-table-div">{{title}}</div>
          <el-table v-loading="emailloading" :data="emailList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="标题" align="left" prop="subject" :show-overflow-tooltip="true"/>
            <el-table-column label="发件人" align="left" prop="fromEmail" :show-overflow-tooltip="true"/>
            <el-table-column label="收件人" align="left" prop="toEmail" :show-overflow-tooltip="true"/>
            <el-table-column label="日期" align="center" prop="time" width="150">
              <template slot-scope="scope">
                <span>{{ parseTime(scope.row.time) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="180"
              class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button
                  v-if="queryEmailParams.emailType === 3"
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="handleEditEmail(scope.row)"
                  v-hasPermi="['tool:email:edit']"
                >编辑</el-button>
                <el-button
                  v-if="queryEmailParams.emailType !== 4"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleDelete(scope.row)"
                  v-hasPermi="['tool:email:remove']"
                >删除</el-button>
                <el-button
                  v-if="queryEmailParams.emailType === 4"
                  size="mini"
                  type="text"
                  icon="el-icon-delete"
                  @click="handleCompDelete(scope.row)"
                  v-hasPermi="['tool:email:remove']"
                >彻底删除</el-button>
                <el-button
                  v-if="queryEmailParams.emailType === 4"
                  size="mini"
                  type="text"
                  @click="handleRecover(scope.row)"
                  v-hasPermi="['tool:email:edit']"
                ><svg-icon icon-class="restore" />恢复</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="emailTotal>0"
            :total="emailTotal"
            :page.sync="queryEmailParams.pageNum"
            :limit.sync="queryEmailParams.pageSize"
            @pagination="getEmailList"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Editor from "@/components/Editor"
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { treeselect } from "@/api/system/dept";
import { listUser } from "@/api/system/user";
import { queryCount, listEmail, delEmail, delCompEmail, recoverEmail, sendEmail, saveDraftEmail } from "@/api/tool/email";

export default {
  name: 'Index',
  components: { Treeselect, Editor },
  data() {
    return {
      loading: false,
      emailloading: false,
      // 是否显示收件人列表弹出层
      open: false,
      // 是否显示写信form
      isShowForm: true,
      // 是否展示邮箱列表
      isShowList: false,
      // 邮箱表头标题
      title: '',
      // 邮件类型
      emailType: undefined,
      // 邮件数量
      count: {
        scount: 0,
        fcount: 0,
        ccount: 0,
        lcount: 0
      },
      // 选中数组
      selection: [],
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 邮件表格数据
      emailList: [],
      emailTotal: 0,
      // 部门树选项
      deptOptions: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 部门名称
      deptName: undefined,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        deptId: undefined
      },
      // 邮件查询参数
      queryEmailParams: {
        pageNum: 1,
        pageSize: 10,
        emailType: undefined
      },
      // 写信form
      form: {
        // 邮件id, 如果是草稿箱则id不为空
        id: undefined,
        subject: '',
        tos: [],
        names: [],
        content: ''
      },
      // fileList: [],
      rules: {
        subject: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getTreeselect();
    this.getEmailCount();
  },
  methods: {
    // 写信点击
    handleWrite() {
      this.isShowForm = true;
      this.isShowList = false;
    },
    // 收件箱, 草稿箱点击
    handleList(title, emailType) {
      this.isShowForm = false;
      this.isShowList = true;
      this.title = title;
      this.queryEmailParams.emailType = emailType;
      this.getEmailList();
    },
    /** 查询邮件数量*/
    getEmailCount() {
      queryCount().then(response => {
          this.count = response.data;
        }
      );
    },
    /** 查询邮件列表*/
    getEmailList() {
      this.emailloading = true;
      listEmail(this.queryEmailParams).then(response => {
          this.emailList = response.rows;
          this.emailTotal = response.total;
          this.emailloading = false;
        }
      );
    },
    /** 删除邮件*/
    handleDelete(row) {
      const id = row.id;
      this.$confirm('是否确认将该邮件移入垃圾箱?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return delEmail(id);
      }).then(() => {
        this.getEmailList();
        this.getEmailCount();
        this.msgSuccess("删除成功");
      }).catch(function() {});
    },
    /** 彻底删除*/
    handleCompDelete(row) {
      const id = row.id;
      this.$confirm('是否彻底删除该邮件?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return delCompEmail(id);
      }).then(() => {
        this.getEmailList();
        this.getEmailCount();
        this.msgSuccess("删除成功");
      }).catch(function() {});
    },
    /** 恢复邮件*/
    handleRecover(row) {
      const id = row.id;
      this.$confirm('是否确认恢复该垃圾邮件吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return recoverEmail(id);
      }).then(() => {
        this.getEmailList();
        this.getEmailCount();
        this.msgSuccess("恢复成功");
      }).catch(function() {});
    },
    /** 编辑邮件*/
    handleEditEmail(row) {
      this.handleWrite();
      this.form.id = row.id;

      let toName = row.toName;
      toName = toName.replace('[', '').replace(']', '');

      this.form.names = toName.split(',');

      let toEmail = row.toEmail;
      toEmail = toEmail.replace('[', '').replace(']', '');
      this.form.tos = toEmail.split(',');
      this.form.subject = row.subject;
      this.form.content = row.content;
    },
    /** 选择收件人*/
    handleSelectTos() {
      this.open = true;
      this.getUserList();
    },
    // 弹出层取消
    cancel() {
      this.open = false;
      this.selection = [];
      this.form.tos = [];
      this.form.names =[];
    },
    /** 查询用户列表 */
    getUserList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getUserList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getUserList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.selection = selection;
    },
    /** 确认收件人选择*/
    confirmSelect() {
      let size = this.selection.length;
      if(size > 0) {
        this.open = false;
        this.form.names = this.selection.map(item => item.userName);
        this.form.tos = this.selection.map(item => item.email);
      } else {
        this.msgError("请选择收件人!")
      }
    },
    // 删除文件之前的钩子
    /*handleBeforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    },*/
    // 文件超出个数限制时的钩子函数
    /*handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },*/
    /** 发送邮件点击事件*/
    handleSendEmail() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let sub = false;
          let size = this.form.names.length;
          if(size < 0 || size === 0) {
            this.msgError("收件邮箱不能为空");
            sub = true
          }
          if (sub) { return false }
          this.form.content = encodeURIComponent(this.form.content);
          sendEmail(this.form).then(res => {
            if(res.code == 200) {
              this.msgSuccess('发送成功');
              this.getEmailList();
              this.getEmailCount();
              this.handleList('发件箱', 2);
            } else {
              this.msgError('发送失败');
            }
            // 清空写信FROM
            this.clearFrom();
          }).catch(err => {})
        } else {
          return false
        }
      });
    },
    /** 存为草稿点击事件*/
    handleSaveDraft() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let sub = false;
          let size = this.form.names.length;
          if(size < 0 || size === 0) {
            this.msgError("收件邮箱不能为空");
            sub = true
          }
          if (sub) { return false }
          this.form.content = encodeURIComponent(this.form.content);
          saveDraftEmail(this.form).then(res => {
            if(res.code == 200) {
              this.msgSuccess('保存成功');
              this.getEmailList();
              this.getEmailCount();
              this.handleList('草稿箱', 3);
            } else {
              this.msgError('保存失败');
            }
            // 清空写信FROM
            this.clearFrom();
          }).catch(err => {})
        } else {
          return false
        }
      });
    },
    // 清空写信FROM
    clearFrom() {
      this.form = {
        id: undefined,
        subject: '',
        tos: [],
        name: [],
        content: ''
      };
    },

  }
}
</script>

<style scoped>
  .el-table-div{
    text-align: center;
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 15px;
  }

  .el-tag-div{
    display: inline-block;
    border: 1px solid #DCDFE6;
    font-size: inherit;
    border-radius: 4px;
    width: 600px;
    height: 32px;
    margin-right: 10px;
    padding-left: 4px;
    margin-bottom: -10px;
  }
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .upload-demo /deep/.el-upload{
    display: block;
    text-align: left;
  }
  .ad{
    font-size: 14px;
    color: #666;
  }
  .first{
    background-color: #f8ac59;
  }
  .second{
    background-color: #ed5565;
  }
  .email_label{
    display: inline;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 8px;
    text-shadow: none;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    vertical-align: baseline;
    border-radius: .25em;
    color: #fff;
    float: right!important;
  }
</style>
