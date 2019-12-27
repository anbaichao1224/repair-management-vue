<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible">
    <el-form :model="dataForm" :rules="dataRule"  ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px" label-position="right"> 
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="dataForm.userName" placeholder="登录帐号"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-radio-group v-model="dataForm.sex">
          <el-radio :label="0">男</el-radio>
          <el-radio :label="1">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="密码" prop="password" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="comfirmPassword" :class="{ 'is-required': !dataForm.id }">
        <el-input v-model="dataForm.comfirmPassword" type="password" placeholder="确认密码"></el-input>
      </el-form-item>
      <el-form-item label="身份证号" prop="idcard">
        <el-input v-model="dataForm.idcard" placeholder="请填写证件号码"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="dataForm.mobile" placeholder="手机号"></el-input>
      </el-form-item>
      <el-form-item label="是否管理员" prop="isadmin">
        <el-radio-group v-model="dataForm.isadmin">>
          <el-radio :label="0">否</el-radio>
          <el-radio :label="1">是</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="职称" size="mini" prop="titles">
        <el-radio-group v-model="dataForm.titles">
          <el-radio v-for="titles in titleList" :key="titles.id" :label="titles.id">{{titles.title}}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="角色" size="mini" prop="roleIdList">
        <el-radio-group v-model="dataForm.roleIdList[0]">
          <el-radio v-for="role in roleList" :key="role.roleId" :label="role.roleId">{{role.roleName }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="上级组织" prop="orgname">
        <el-popover
          ref="menuListPopover"
          placement="bottom-start"
          trigger="click">
          <el-tree
            :data="orgList"
            :props="orgListTreeProps"
            node-key="id"
            ref="menuListTree"
            @current-change="menuListTreeCurrentChangeHandle"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.orgname" v-popover:menuListPopover :readonly="true" placeholder="点击选择上级组织" class="menu-list__input"></el-input>
      </el-form-item>
      <el-form-item label="状态" size="mini" prop="status">
        <el-radio-group v-model="dataForm.status">
          <el-radio :label=0>禁用</el-radio>
          <el-radio :label=1>正常</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>



</template>

<script>
  import { isMobile } from '@/utils/validate'
  import { treeDataTranslate1 } from '@/utils'

  export default {
    data () {
      var validatePassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('密码不能为空'))
        } else {
          callback()
        }
      }
      var validateComfirmPassword = (rule, value, callback) => {
        if (!this.dataForm.id && !/\S/.test(value)) {
          callback(new Error('确认密码不能为空'))
        } else if (this.dataForm.password !== value) {
          callback(new Error('确认密码与密码输入不一致'))
        } else {
          callback()
        }
      }
      var validateIdcard = (rule, value, callback) => {
        // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        if (reg.test(value)) {
          callback()
        } else {
          callback(new Error('身份证号码不正确'))
        }
      }
      var validateMobile = (rule, value, callback) => {
        if (!isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        visible: false,
        dialogGridVisible: false,
        roleList: [],
        titleList: [],
        dataForm: {
          id: 0,
          userName: '',
          password: '',
          comfirmPassword: '',
          salt: '',
          idcard: '',
          mobile: '',
          orgid: '',
          roleIdList: [],
          titles: 0,
          status: 1,
          sex: 0,
          orgname:'',
          isadmin: 0
        },
        orgList: [],
        orgListTreeProps: {
          label: 'name',
          children: 'children'
        },
        parentList: [],
        dataRule: {
          userName: [
            { required: true, message: '用户名不能为空', trigger: 'blur' }
          ],
          password: [
            { validator: validatePassword, trigger: 'blur' }
          ],
          comfirmPassword: [
            { validator: validateComfirmPassword, trigger: 'blur' }
          ],
          idcard: [
            { required: true, message: '身份证号不能为空', trigger: 'blur' },
            { validator: validateIdcard, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '手机号不能为空', trigger: 'blur' },
            { validator: validateMobile, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      init (id) {
        this.dataForm.id = id || 0
        this.$http({
          url: this.$http.adornUrl('/sys/role/select'),
          method: 'get',
          params: this.$http.adornParams()
        }).then(({data}) => {
          this.roleList = data && data.code === 0 ? data.list : []
        }).then(() => {
          this.visible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].resetFields()
          })
        }).then(() => {
            this.$http({
                url: this.$http.adornUrl('/sys/org/select'),
                method: 'get',
                params: this.$http.adornParams()
            }).then(({data}) => {
              this.orgList = treeDataTranslate1(data.orgList, 'id')
            }).then(() => {
                this.visible = true
                this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
              })
            })
            if (this.dataForm.id) {
              // 新增
              this.menuListTreeSetCurrentNode()
            }
        }).then(() => {
            this.$http({
                url: this.$http.adornUrl('/sys/title/list'),
                method: 'post',
                params: this.$http.adornParams()
            }).then(({data}) => {
                if (data && data.code === 0) {
                  this.titleList= data.title
              }
            }).then(() => {
              this.visible = true
              this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
              })
            }).then(() => {
                this.$http({
                    url: this.$http.adornUrl(`/sys/user/info/${this.dataForm.id}`),
                    method: 'get',
                    params: this.$http.adornParams()
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.dataForm.userName = data.user.username
                    this.dataForm.salt = data.user.salt
                    this.dataForm.idcard = data.user.idcard
                    this.dataForm.sex = data.user.sex
                    this.dataForm.mobile = data.user.mobile
                    this.dataForm.orgid = data.user.orgid
                    this.dataForm.titles = data.user.title * 1
                    this.dataForm.roleIdList = data.user.roleIdList
                    this.dataForm.status = data.user.status 
                    this.dataForm.isadmin = data.user.isadmin
                    this.menuListTreeSetCurrentNode()
                  }
                })
            })
         })
      },
      // 表单提交
      dataFormSubmit () {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.$http({
              url: this.$http.adornUrl(`/sys/user/${!this.dataForm.id ? 'save' : 'update'}`),
              method: 'post',
              data: this.$http.adornData({
                'userId': this.dataForm.id || undefined,
                'username': this.dataForm.userName,
                'password': this.dataForm.password,
                'salt': this.dataForm.salt,
                'idcard': this.dataForm.idcard,
                'mobile': this.dataForm.mobile,
                'status': this.dataForm.status,
                'sex': this.dataForm.sex,
                'title': this.dataForm.titles,
                'orgid': this.dataForm.orgid,
                'orgname':this.dataForm.orgname,
                'roleIdList': [this.dataForm.roleIdList[0]],
                'isadmin' : this.dataForm.isadmin
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                this.$message({
                  message: '操作成功',
                  type: 'success',
                  duration: 1500,
                  onClose: () => {
                    this.visible = false
                    this.$emit('refreshDataList')
                  }
                })
              } else {
                this.$message.error(data.msg)
              }
            })
          }
        })
      },
      // 菜单树选中
      menuListTreeCurrentChangeHandle (data, node) {
        this.dataForm.orgid = data.id
        this.dataForm.orgname = data.name
      },
      // 菜单树设置当前选中节点
      menuListTreeSetCurrentNode () {
        this.$refs.menuListTree.setCurrentKey(this.dataForm.orgid)
        this.dataForm.orgname = (this.$refs.menuListTree.getCurrentNode() || {})['name']
      }
    },
      computed: {
          documentClientHeight: {
            get () { return this.$store.state.common.documentClientHeight },
            set (val) { this.$store.commit('common/updateDocumentClientHeight', val) }
          },
          sidebarFold: {
            get () { return this.$store.state.common.sidebarFold }
          },
          userId: {
            get () { return this.$store.state.user.id },
            set (val) { this.$store.commit('user/updateId', val) }
          },
          userName: {
            get () { return this.$store.state.user.name },
            set (val) { this.$store.commit('user/updateName', val) }
          },
          updateOrgId: {
            get () { return this.$store.state.user.orgid },
            set (val) { this.$store.commit('user/updateOrgId', val) }
          },
          updateMobile: {
            get () { return this.$store.state.user.mobile },
            set (val) { this.$store.commit('user/updateMobile', val) }
          },
          updateIsadmin: {
            get () { return this.$store.state.user.isadmin },
            set (val) { this.$store.commit('user/updateIsadmin', val) }
          },
          updateTitle: {
            get () { return this.$store.state.user.title },
            set (val) { this.$store.commit('user/updateTitle', val) }
          }
      }
  }
</script>
