<template>
  <div class="mod-org">
    <el-form :inline="true" :model="dataForm">
      <el-form-item>
        <el-button v-if="isAuth('sys:org:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="dataList" row-key="id" border :tree-props="{children: 'children', hasChildren: 'hasChildren'}" style="width: 100%; ">
      <el-table-column prop="name" header-align="center" min-width="150" label="名称"></el-table-column>
      <el-table-column prop="parentname" header-align="center"  align="center"  width="120" label="上级菜单"></el-table-column>
      <el-table-column prop="orderby" header-align="center" align="center" label="排序号"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="isAuth('sys:org:update')"
            type="text"
            size="small"
            @click="addOrUpdateHandle(scope.row.id)"
          >修改</el-button>
          <el-button
            v-if="isAuth('sys:org:delete')"
            type="text"
            size="small"
            @click="deleteHandle(scope.row.id,scope.row.name)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from "./org-add-or-update";
import { treeDataTranslate1 } from "@/utils";
export default {
  data() {
    return {
      dataForm: {},
      dataList: [],
      dataListLoading: false,
      addOrUpdateVisible: false
    };
  },
  components: {
    AddOrUpdate
  },
  activated() {
    this.getDataList();
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.dataListLoading = true;
      this.$http({
        url: this.$http.adornUrl("/sys/org/list"),
        method: "get",
        params: this.$http.adornParams()
      }).then(({ data }) => {
        this.dataList = treeDataTranslate1(data, "id");
        this.dataListLoading = false;
      });
    },
    // 新增 / 修改
    addOrUpdateHandle(id) {
      this.addOrUpdateVisible = true;
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(id);
      });
    },
    // 删除
    deleteHandle(id,name) {
      this.$confirm(`确定对[${name}]进行[删除]操作?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl(`/sys/org/delete/${id}`),
            method: "post",
            data: this.$http.adornData()
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$message({
                message: "操作成功",
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.getDataList();
                }
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        })
        .catch(() => {});
    }
  }
};
</script>
