<template>
  <div class="table-box">
    <div class="card table-main">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:menu:add']"
          >新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            icon="Sort"
            @click="toggleExpandAll"
          >展开/折叠</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
      <el-table v-if="refreshTable" v-loading="loading" :data="menuList"
                row-key="menuId"
                :default-expand-all="isExpandAll"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
        <el-table-column prop="icon" label="图标" align="center" width="100">
          <template #default="scope">
            <el-icon>
              <component :is="scope.row.icon"></component>
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="60"></el-table-column>
        <el-table-column prop="funcPerms" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.status ===0" type="primary" >正常</el-tag>
            <el-tag v-else type="danger" >停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="180" prop="createTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="210" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['system:menu:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="新增" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-auth="['system:menu:add']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-auth="['system:menu:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加或修改用户配置对话框 -->
      <el-drawer :title="title" v-model="editModalVisible" :destroy-on-close="true" size="450px">
        <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="上级菜单">
            <el-tree-select
              v-model="form.parentId"
              :data="menuList"
              :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
              value-key="menuId"
              placeholder="选择上级菜单"
              check-strictly
            />
          </el-form-item>
          <el-form-item label="菜单类型" prop="menuType">
            <el-radio-group v-model="form.type">
              <el-radio :label="1">菜单</el-radio>
              <el-radio :label="2">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
<!--          <el-form-item label="菜单图标" prop="icon">-->
<!--            <el-popover-->
<!--              placement="bottom-start"-->
<!--              :width="540"-->
<!--              v-model:visible="showChooseIcon"-->
<!--              trigger="click"-->
<!--              @show="showSelectIcon"-->
<!--            >-->
<!--              <template #reference>-->
<!--                <el-input v-model="form.icon" placeholder="点击选择图标" @blur="showSelectIcon" v-click-outside="hideSelectIcon" readonly>-->
<!--                  <template #prefix>-->
<!--                    <svg-icon-->
<!--                      v-if="form.icon"-->
<!--                      :icon-class="form.icon"-->
<!--                      class="el-input__icon"-->
<!--                      style="height: 32px;width: 16px;"-->
<!--                    />-->
<!--                    <el-icon v-else style="height: 32px;width: 16px;"><search /></el-icon>-->
<!--                  </template>-->
<!--                </el-input>-->
<!--              </template>-->
<!--              <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon" />-->
<!--            </el-popover>-->
<!--          </el-form-item>-->
          <el-form-item label="菜单名称" prop="menuName">
            <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item label="显示排序" prop="orderNum">
            <el-input-number v-model="form.sort" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item>
            <template #label>
            <span>
              <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>是否外链
            </span>
            </template>
            <el-radio-group v-model="form.isOutChain">
              <el-radio label="0">是</el-radio>
              <el-radio label="1">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="path">
            <template #label>
            <span>
               <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                  <el-icon><question-filled /></el-icon>
               </el-tooltip>
               路由地址
            </span>
            </template>
            <el-input v-model="form.path" placeholder="请输入路由地址" />
          </el-form-item>
          <el-form-item prop="component">
            <template #label>
            <span>
               <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                  <el-icon><question-filled /></el-icon>
               </el-tooltip>
               组件路径
            </span>
            </template>
            <el-input v-model="form.component" placeholder="请输入组件路径" />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100" />
            <template #label>
            <span>
               <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                  <el-icon><question-filled /></el-icon>
               </el-tooltip>
               权限字符
            </span>
            </template>
          </el-form-item>
          <!--        <el-form-item>-->
          <!--          <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />-->
          <!--          <template #label>-->
          <!--            <span>-->
          <!--               <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">-->
          <!--                  <el-icon><question-filled /></el-icon>-->
          <!--               </el-tooltip>-->
          <!--               路由参数-->
          <!--            </span>-->
          <!--          </template>-->
          <!--        </el-form-item>-->
          <!--        <el-form-item>-->
          <!--          <template #label>-->
          <!--            <span>-->
          <!--               <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">-->
          <!--                  <el-icon><question-filled /></el-icon>-->
          <!--               </el-tooltip>-->
          <!--               是否缓存-->
          <!--            </span>-->
          <!--          </template>-->
          <!--          <el-radio-group v-model="form.isCache">-->
          <!--            <el-radio label="0">缓存</el-radio>-->
          <!--            <el-radio label="1">不缓存</el-radio>-->
          <!--          </el-radio-group>-->
          <!--        </el-form-item>-->
          <el-form-item>
            <template #label>
            <span>
               <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                  <el-icon><question-filled /></el-icon>
               </el-tooltip>
               显示状态
            </span>
            </template>
            <el-radio-group v-model="form.isShow">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item>
            <template #label>
            <span>
               <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <el-icon><question-filled /></el-icon>
               </el-tooltip>
               菜单状态
            </span>
            </template>
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in menuStatus"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div class="flex justify-center">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="editModalVisible=false">取 消</el-button>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'
import { menuStatus, getAllMenuList } from '@/api/system/menu'
import { parseTime } from '@/utils/tool'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteUser } from '@/api/system/user'

const loading = ref(false)
const refreshTable = ref(true)
const isExpandAll = ref(false)
const editModalVisible = ref(false)
const title = ref('')
const ids = ref([])
const menuFormRef = ref()

const form = ref({})
const rules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
}

const submitForm = () => {}

const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
const handleUpdate = (rowData) => {}
const handleAdd = (rowData) => {}

const handleDelete = (rowData:any = {}) => {
  const menuIds = rowData.menuId ? [rowData.menuId] : ids.value
  const deleteIds = menuIds.map((item) => {
    return { id: item }
  })
  ElMessageBox.confirm(`是否删除菜单【${rowData.menuName}】的数据?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteUser(deleteIds)
    ElMessage({ type: 'success', message: '删除成功!' })
    await getList()
  })
}

const dateRange = ref([])
const queryParams = reactive({
  funcPerms: undefined,
  menuName: undefined,
  status: undefined
})
const menuList = ref([])
const getList = async () => {
  loading.value = true
  console.log('=====')
  const { result } = await getAllMenuList(queryParams)
  loading.value = false
  menuList.value = result
}

// const handleQuery = () => {
//   queryParams.currentPage = 1
//   queryParams.startTime = undefined
//   queryParams.endTime = undefined
//   if (dateRange.value && dateRange.value.length === 2) [queryParams.startTime, queryParams.endTime] = dateRange.value
//   getList()
// }
// const queryRef = ref()
// const resetQuery = () => {
//   dateRange.value = []
//   queryParams.startTime = undefined
//   queryParams.endTime = undefined
//   queryRef.value.resetFields()
//   queryParams.currentPage = 1
//   getList()
// }
getList()
</script>

<style scoped>

</style>
