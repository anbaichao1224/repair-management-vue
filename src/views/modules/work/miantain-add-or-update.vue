<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    :visible.sync="visible" top="5vh">
    <el-form :model="dataForm" v-if="showtype=='add'" :rules="dataRule"  ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px" label-position="right"> 

      <el-form-item label="标题" prop="title" >
        <el-input v-model="dataForm.title" disabled placeholder="输入标题" ></el-input>
      </el-form-item>

      <el-form-item label="日期" prop="taskdate">
        <el-date-picker
          v-model="dataForm.taskdate"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期"
          disabled
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="位置" prop="position">
        <el-input v-model="dataForm.position" placeholder="输入位置" disabled></el-input>
      </el-form-item>

     <el-form-item label="报修分类" prop="types">
        <el-select v-model="dataForm.types" placeholder="请选择" disabled>
          <el-option v-for="item in options" :key="item.value"  :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="图片" prop="picList">
              <el-carousel indicator-position="outside" height="350px"> 
              <el-carousel-item v-for="item in dataForm.picList" :key="item.id">
                <el-popover placement="right" title="" trigger="hover">
                <img  :src="item.url" style="height:50%;width:350px"/>
                <img  slot="reference" :src="item.url" :alt="item.url"  style="height:100%;width:100%">
               </el-popover>
              </el-carousel-item>  
            </el-carousel>
      </el-form-item>

      <el-form-item label="描述:" prop="desc">
        <el-input
          disabled
          type="textarea"
          :rows="3"
          placeholder="请输入描述内容"
          v-model="dataForm.desc">
        </el-input>
      </el-form-item>


     <el-form-item label="处理人" prop="orgname">
       <select name="public-choice" v-model="assignerSelected" @change="getCouponSelected">       
          <option value="" selected>请选择处理人</option>                                         
          <option :value="ass.userid" v-for="ass in assList" :key="ass.userid" >{{ass.username}}</option>                                    
       </select>
      </el-form-item> 

      <el-form-item label="上报人" prop="creuser">
        <el-input v-model="dataForm.creuser" placeholder="" disabled></el-input>
      </el-form-item>

      <el-form-item label="上报人电话" prop="cremobile">
        <el-input v-model="dataForm.cremobile" placeholder="" disabled></el-input>
      </el-form-item>
    </el-form>

    <!----   查看   ----->

    <el-form :model="dataForm" v-if="showtype=='look'" :rules="dataRule"  ref="dataForm" @keyup.enter.native="dataFormSubmit()" label-width="100px" label-position="right"> 

      <el-form-item label="标题" prop="title" >
        <el-input v-model="dataForm.title" disabled placeholder="输入标题" ></el-input>
      </el-form-item>

      <el-form-item label="日期" prop="taskdate">
        <el-date-picker
          v-model="dataForm.taskdate"
          type="date"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="选择日期"
          disabled
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="位置" prop="position">
        <el-input v-model="dataForm.position" placeholder="输入位置" disabled></el-input>
      </el-form-item>

     <el-form-item label="报修分类" prop="types">
        <el-select v-model="dataForm.types" placeholder="请选择" disabled>
          <el-option v-for="item in options" :key="item.value"  :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="图片" prop="picList">
              <el-carousel indicator-position="outside" height="350px"> 
              <el-carousel-item v-for="item in dataForm.picList" :key="item.id">
                <el-popover placement="right" title="" trigger="hover">
                <img  :src="item.url" style="height:50%;width:350px"/>
                <img  slot="reference" :src="item.url" :alt="item.url"  style="height:100%;width:100%">
               </el-popover>
              </el-carousel-item>  
            </el-carousel>
      </el-form-item>

      <el-form-item label="描述:" prop="desc">
        <el-input
          disabled
          type="textarea"
          :rows="3"
          placeholder="请输入描述内容"
          v-model="dataForm.desc">
        </el-input>
      </el-form-item>


      <el-form-item label="处理人" prop="assigner">
        <el-input v-model="dataForm.assigner" disabled ></el-input>
      </el-form-item>


      <el-form-item label="上报人" prop="creuser">
        <el-input v-model="dataForm.creuser" placeholder="" disabled></el-input>
      </el-form-item>

      <el-form-item label="上报人电话" prop="cremobile">
        <el-input v-model="dataForm.cremobile" placeholder="" disabled></el-input>
      </el-form-item>
    </el-form>


    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" v-if="showtype=='add'" @click="dataFormSubmit()">确定</el-button>
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
        assignerSelected:'',
        assigner: '',
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
        assList: [],
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
    props:[
      'showtype'
    ],
    methods: {
      init (id,assigner) {
        
        this.url = this.$http.adornUrl('/sys/task/upload')
        this.dataForm.id = id || 0
        this.assigner = assigner
        this.$http({
                url: this.$http.adornUrl('/sys/org/selectByTask'),
                method: 'get',
                params: this.$http.adornParams()
            }).then(({data}) => {
              this.orgList = treeDataTranslate1(data.orgList, 'id')
            }).then(() => {
                this.visible = true
                this.$nextTick(() => {
              })
            }).then(()=>{
              this.$http({
                    url: this.$http.adornUrl(`/sys/org/getOrgUser`),
                    method: 'post',
                    data: this.$http.adornData({"assigner":this.assigner})
                }).then(({data}) => {
                  if (data && data.code === 0) {
                      console.log(JSON.stringify(data))
                      console.log(JSON.stringify(this.assList))
                      this.assList= data.userList
                  }
                })
          }).then(() => {
             this.assignerSelected = this.assList[0].userid;
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
                    //this.menuListTreeSetCurrentNode()
                    let arr = []
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
            if (!this.dataForm.assigner) {
                  this.$message.error('请选择维修人')
                  return
            }
            let params = {
                "updateuser": this.userId,
                "id": this.dataForm.id,
                "assigner": this.dataForm.assigner,
                "status": "2"
            }
            this.$http({
              url: this.$http.adornUrl(`/sys/task/updateAssigner`),
              method: 'post',
              data: this.$http.adornData(params)
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
      getCouponSelected(){
           console.log(this.assignerSelected)
      },
      // // 菜单树选中
      // menuListTreeCurrentChangeHandle (data, node) {
      //   this.dataForm.assigner = data.userid
      //   this.dataForm.orgname = data.name
      // },
      // //菜单树设置当前选中节点
      // menuListTreeSetCurrentNode () {
      //   this.$refs.menuListTree.setCurrentKey(this.dataForm.assigner)
      //   this.dataForm.orgname = (this.$refs.menuListTree.getCurrentNode() || {})['name']
      // },
      handlePreview(file) {
        this.dialogImageUrl = file.path;
        this.dialogVisible = true;
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
<style>
 .carousel_image_type1{
     width: 100%;
     height: 100%;
  }

  .carousel_image_type{
     width: 50%;
     height: 50%;
  }
</style>