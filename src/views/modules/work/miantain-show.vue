<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible" top="5vh">
    <el-form :model="dataForm" :rules="dataRule"  ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px" label-position="right"> 

      <el-form-item label="标题" prop="title" >
        <el-input v-model="dataForm.title" disabled placeholder="输入标题"></el-input>
      </el-form-item>

      <el-form-item label="日期" prop="taskdate">
        <el-date-picker
          v-model="dataForm.taskdate"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="位置" prop="position">
        <el-input v-model="dataForm.position" placeholder="输入位置"></el-input>
      </el-form-item>

     <el-form-item label="报修分类" prop="types">
        <el-select v-model="dataForm.types" placeholder="请选择">
          <el-option v-for="item in options" :key="item.value"  :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="图片" prop="picList">
        <el-upload
          class="upload-demo"
          :action="url"
          ref="upload"
          :multiple="true"
          accept="image/jpeg,image/jpg,image/png"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-upload="beforeUploadHandle"
          :on-success="successHandle"
          :file-list="dataForm.picList"
          list-type="picture-card">
          <i class="el-icon-plus" ></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible" top="10vh" append-to-body="">
          <img width="80%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>

      <el-form-item label="描述:" prop="desc">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="请输入描述内容"
          v-model="dataForm.desc">
        </el-input>
      </el-form-item>

    
      <el-form-item label="处理人" prop="orgname">
        <el-popover
          ref="menuListPopover"
          placement="bottom-start"
          trigger="click">
          <el-tree
            :data="orgList"
            :props="orgListTreeProps"
            node-key="userid"
            ref="menuListTree"
            @current-change="menuListTreeCurrentChangeHandle"
            :default-expand-all="true"
            :highlight-current="true"
            :expand-on-click-node="false">
          </el-tree>
        </el-popover>
        <el-input v-model="dataForm.orgname" v-popover:menuListPopover :readonly="true" placeholder="点击选择处理人" class="menu-list__input"></el-input>
      </el-form-item>

      <el-form-item label="上报人" prop="creuser">
        <el-input v-model="dataForm.creuser" placeholder=""></el-input>
      </el-form-item>

      <el-form-item label="上报人电话" prop="cremobile">
        <el-input v-model="dataForm.cremobile" placeholder=""></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
    </span>
  </el-dialog>



</template>

<script>
  import { isMobile } from '@/utils/validate'
  import { treeDataTranslate1 } from '@/utils'

  export default {
    data () {
      var validateMobile = (rule, value, callback) => {
        if (!isMobile(value)) {
          callback(new Error('手机号格式错误'))
        } else {
          callback()
        }
      }
      return {
        url: '',
        visible: false,
        dialogVisible: false,
        dialogImageUrl :'',
        num: 0,
        successNum: 0,
        dataForm: {
          id: 0,
          title: '',
          taskdate: '',
          position: '',
          desc: '',
          creuser: '',
          cremobile: '',
          org: '',
          status: 0,
          orgname:'',
          picList:[],
          types: null,
          assigner: ''
        },
        savePicList: [],
        pList: [],
        orgList: [],
        orgListTreeProps: {
          label: 'showname',
          children: 'children'
        },
        options: [{
          value: 1,
          label: '房产'
        }, {
          value: 2,
          label: '电力'
        }, {
          value: 3,
          label: '水暖'
        }, {
          value: 4,
          label: '其他'
        }],
        addData:{
          sysTaskEntity:{},
          picList: []
        },
        dataRule: {
      
        }
      }
    },
    methods: {
      inits (id) {
        this.url = this.$http.adornUrl('/sys/task/upload')
        this.dataForm.id = id || 0
        this.$http({
                url: this.$http.adornUrl('/sys/org/selectByTask'),
                method: 'get',
                params: this.$http.adornParams()
            }).then(({data}) => {
              this.orgList = treeDataTranslate1(data.orgList, 'id')
            }).then(() => {
                this.visible = true
                this.$nextTick(() => {
                this.$refs['dataForm'].resetFields()
                  if (this.dataForm.id) {
                    this.menuListTreeSetCurrentNode()
                  }
              })
            }).then(() => {
            if(this.dataForm.id){
                this.$http({
                    url: this.$http.adornUrl(`/sys/task/info`),
                    method: 'post',
                    data: this.$http.adornData({"id":this.dataForm.id})
                }).then(({data}) => {
                  if (data && data.code === 0) {
                    this.dataForm.title = data.task.sysTaskEntity.title
                    this.dataForm.position = data.task.sysTaskEntity.position
                    this.dataForm.desc = data.task.sysTaskEntity.desc
                    this.dataForm.taskdate = data.task.sysTaskEntity.taskdate
                    this.dataForm.creuser = data.task.sysTaskEntity.creuser
                    this.dataForm.creuserid = data.task.sysTaskEntity.creuserid
                    this.dataForm.cremobile = data.task.sysTaskEntity.cremobile
                    this.dataForm.assigner = data.task.sysTaskEntity.assigner
                    this.dataForm.org = data.task.sysTaskEntity.org * 1
                    this.dataForm.status = data.task.sysTaskEntity.status 
                    this.dataForm.types = data.task.sysTaskEntity.types
                    this.dataForm.orgname = data.task.sysTaskEntity.orgname
                    this.savePicList = data.task.picList

                    this.menuListTreeSetCurrentNode()
                    let arr = [];
                    data.task.picList.forEach(element => {
                        arr.push({"name":element.id,"url":element.path})
                    });
                   this.dataForm.picList = arr
                  }
                })
            }else{
              this.dataForm.creuser = this.userName
              this.dataForm.cremobile = this.userMobile
            }
          }) 
      },
      // 表单提交
      dataFormSubmit () {
       // this.$refs['dataForm'].validate((valid) => {
         // if (valid) {
            let arrs = []
            this.addData.sysTaskEntity = {
                'id': this.dataForm.id || undefined,
                'types':this.dataForm.types,
                'title': this.dataForm.title,
                'position': this.dataForm.position,
                'desc': this.dataForm.desc,
                'taskdate': this.dataForm.taskdate,
                'creuser': this.dataForm.creuser,
                'assigner': this.dataForm.assigner,
                'cremobile': this.dataForm.cremobile,
                'creuserid': this.userId,
                'status': this.dataForm.status
            },
           
            this.addData.picList= this.savePicList

            if (!this.addData.sysTaskEntity.title) {
                  this.$message.error('请填写标题')
                  return
            }
            if (!this.addData.sysTaskEntity.types) {
                    this.$message.error('请选择维修类型')
                    return
              }
            if (!this.addData.sysTaskEntity.position) {
                  this.$message.error('请选择位置')
                  return
            }
            if (!this.addData.sysTaskEntity.taskdate) {
                  this.$message.error('请选择时间')
                  return
            }
            if (!this.addData.sysTaskEntity.assigner) {
                  this.$message.error('请选择维修人')
                  return
            }
            if (!this.addData.sysTaskEntity.cremobile) {
                  this.$message.error('请填写联系电话')
                  return
            }else {
                 var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
                if (!myreg.test(this.addData.sysTaskEntity.cremobile)) {
                    this.$message.error('请正确的联系电话')
                    return 
                }
            }

            this.$http({
              url: this.$http.adornUrl(`/sys/task/${!this.dataForm.id ? 'saveTask' : 'updateTask'}`),
              method: 'post',
              data: this.$http.adornData(this.addData)
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
      },
      // 菜单树选中
      menuListTreeCurrentChangeHandle (data, node) {
        console.log(data.userid)
        this.dataForm.assigner = data.userid
        this.dataForm.orgname = data.showname
      },
      // 菜单树设置当前选中节点
      menuListTreeSetCurrentNode () {
        this.$refs.menuListTree.setCurrentKey(this.dataForm.assigner)
        this.dataForm.orgname = (this.$refs.menuListTree.getCurrentNode() || {})['showname']
      },//上传图片涉及到的方法
      handleRemove(file, picList) {
        let arrs = []
         picList.forEach(element=>{
                arrs.push({
                    "path": element.url
                })
            })
         this.savePicList = arrs
        this.$message({
          type: 'info',
          message: '已删除原有图片',
          duration: 1000
        });
      },
      handlePreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
       handleChange(file,picList){
         console.log("change"+JSON.stringify(picList))
         let arrs = []
         this.picList.forEach(element=>{
                arrs.push({
                    "path": element.url
                })
            })
         this.savePicList = arrs
       },// 上传之前
      beforeUploadHandle (file) {
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
          this.$message.error('只支持jpg、png、gif格式的图片！')
          return false
        }
        this.num++
      },
      // 上传成功
      successHandle (response, file, picList) {
        this.pList = picList
        this.successNum++
        if (response && response.code === 0) {
           let picss ={
             path:response.url
           }
           this.savePicList.push(picss)
        } else {
          this.$message.error(response.msg)
        }
      }
  },computed: {
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
          userOrgId: {
            get () { return this.$store.state.user.orgid },
            set (val) { this.$store.commit('user/updateOrgId', val) }
          },
          userMobile: {
            get () { return this.$store.state.user.mobile },
            set (val) { this.$store.commit('user/updateMobile', val) }
          },
          userIsadmin: {
            get () { return this.$store.state.user.isadmin },
            set (val) { this.$store.commit('user/updateIsadmin', val) }
          },
          userTitle: {
            get () { return this.$store.state.user.title },
            set (val) { this.$store.commit('user/updateTitle', val) }
          }
      }
  }
</script>
