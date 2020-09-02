<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类列表 -->
      <el-table
        :data="catelist"
        border
        stripe
        row-key="cat_id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="分类名称" prop="cat_name">
          
        </el-table-column>
        <el-table-column label="分类排序">
          <template v-slot="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag
              type="success"
              size="mini"
              v-else-if="scope.row.cat_level === 1"
              >二级</el-tag
            >
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" 
              >编辑</el-button
            >
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCate(scope.row.cat_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader
              expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps "
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      
      
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo,
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      console.log(res.data)
      // 把数据列表，赋值给 catelist
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 处理树形结构
    handleNodeClick(catelist) {
      console.log(catelist)
    },
     // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
      async removeCate(cat_id) {
      // 弹框询问角色是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)

      // 如果用户确认删除，则返回值为字符串 confirm
      // 如果用户取消了删除，则返回值为字符串 cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('categories/' + cat_id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败！')
      }

      this.$message.success('删除分类成功！')
      this.getCateList()
    },
  },
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
