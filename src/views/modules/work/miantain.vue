<template>
  <div class="mod-user">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.title" placeholder="标题" clearable></el-input>
      </el-form-item>
      <el-form-item label="时间：" prop="setime">
          <el-date-picker v-model="setime" :editable="false" value-format="yyyy-MM-dd" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="dataForm.status" placeholder="请选择">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('sys:user:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      :default-sort = "{prop: 'data', order: 'descending'}"
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="index"
        width="50"
        >
    </el-table-column>
      <el-table-column
        prop="title"
        header-align="center"
        align="center"
        label="标题">
      </el-table-column>
      <el-table-column
        prop="taskdate"
        header-align="center"
        align="center"
        sortable
        width="180"
        label="日期">
      </el-table-column>
      <el-table-column
        prop="position"
        header-align="center"
        align="center"
        label="位置">
      </el-table-column>
      <el-table-column
        prop="desc"
        header-align="center"
        align="center"
        label="描述">
      </el-table-column>
      <el-table-column
        prop="creuser"
        header-align="center"
        align="center"
        width="100"
        sortable
        label="上报人">
      </el-table-column>
      <el-table-column
        prop="cremobile"
        header-align="center"
        align="center"
        width="120"
        label="上报人电话">
      </el-table-column>
      <!-- <el-table-column
        prop="orgname"
        header-align="center"
        align="center"
        width="120"
        label="维修组">
      </el-table-column> -->
      <el-table-column
        prop="assignername"
        header-align="center"
        align="center"
        width="80"
        label="处理人">
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态"
        width="80"
        >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.status === 0" size="small" type="danger">待分配</el-tag>
          <el-tag v-else-if="scope.row.status === 1" size="small">已分配</el-tag>
          <el-tag v-else-if="scope.row.status === 2" size="small">待处理</el-tag>
          <el-tag v-else-if="scope.row.status === 3" size="small">已处理</el-tag>
        </template>
      </el-table-column>
     
       <el-table-column prop="pictures" label="描述图片">
          <template scope="scope">
            <el-carousel :interval="4000" type="card" height="100px">
              <el-carousel-item v-for="item in scope.row.picEntityList" :key="item.path">
                <img style="width: 100px; height: 100px" :src="item.path"/>
              </el-carousel-item>
            </el-carousel>
          </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 2 && scope.row.status === 3" type="text" size="small" @click="showHand(scope.row.id)">查看</el-button>
          <el-button v-if="scope.row.status === 0 && scope.row.status === 1" type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
  import AddOrUpdate from './enter-add-or-update'
  import { treeDataTranslate1 } from '@/utils'

  export default {
    data () {
      return {
        dataForm : {
          title : '',
          status : '',
          startdate : '',
          enddate : ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false,
        setime: [],
        options: [{
          value: '',
          label: '全部'
        }, {
          value: '1',
          label: '待处理'
        }, {
          value: '3',
          label: '已完成'
        }]
      }
    },
    components: {
      AddOrUpdate
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/sys/task/list'),
          method: 'post',
          data: this.$http.adornData({
            'pageSize': this.pageSize,
            'pageNum': this.pageIndex,
            'title': this.dataForm.title,
            'startdate': this.dataForm.startdate,
            'enddate' : this.dataForm.enddate,
            'status' : this.dataForm.startdate
          })
        }).then(({data}) => {
          console.log(data)
          if (data && data.code === 0) {
            this.dataList = data.page.records
            this.totalPage = data.page.total
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id)
        })
      },
      // 删除
      deleteHandle (row) {
        let id = row
        this.$confirm('删除该条任务, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl(`/sys/task/delete/${id}`),
            method: 'post',
            data: this.$http.adornData()
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      },
      formatter(row, column) {
        return row.address;
      }
    },watch: {
          setime (val) {
            if (val && val.length == 2) {
              this.dataForm.startdate = moment(val[0]).format('YYYY-MM-DD')
              this.dataForm.enddate = moment(val[1]).format('YYYY-MM-DD')
            } else {
              this.dataForm.startdate = ''
              this.dataForm.enddate = ''
            }
          }
      }
  }
</script>
<style>
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 200px;
    margin: 0;
  }
  
  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }
  
  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>