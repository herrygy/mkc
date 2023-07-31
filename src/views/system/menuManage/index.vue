<template>
  <div class="table-box">
    <div class="card table-main">
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus"
                     v-auth="['system:menu:add']"
                     @click="handleAdd">新增</el-button>
          <el-button type="primary" plain :icon="Delete"
                     v-auth="['system:role:delete']"
                     :disabled="ids.length===0"
                     @click="handleDelete">删除</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button type="info" plain icon="Sort"
                     @click="toggleExpandAll">展开/折叠</el-button>
        </el-col>
      </el-row>
      <el-table v-if="refreshTable" v-loading="loading" :data="menuList"
                row-key="menuId"
                :default-expand-all="isExpandAll"
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
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
        <el-form ref="menuFormRef" :model="form" :rules="rules" label-width="100px">
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
          <el-form-item label="菜单类型" prop="type">
            <el-radio-group v-model="form.type">
              <el-radio :label="1">菜单</el-radio>
              <el-radio :label="2">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单图标" prop="icon">
            <SelectIcon v-model:icon-value="form.icon" />
          </el-form-item>
          <el-form-item label="菜单名称" prop="menuName">
            <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
          </el-form-item>
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="form.sort" controls-position="right" :min="0" />
          </el-form-item>
          <template v-if="form.type===1">
            <el-form-item>
              <template #label>
                <span class="flex items-center">
                  <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                     <el-icon><QuestionFilled /></el-icon>
                  </el-tooltip>是否外链
                </span>
              </template>
              <el-radio-group v-model="form.isOutChain">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="path">
              <template #label>
                <span class="flex items-center">
                   <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                     <el-icon><QuestionFilled /></el-icon>
                   </el-tooltip>
                   路由地址
                </span>
              </template>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
            <el-form-item prop="component">
              <template #label>
                <span class="flex items-center">
                   <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                     <el-icon><QuestionFilled /></el-icon>
                   </el-tooltip>
                   组件路径
                </span>
              </template>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </template>

          <el-form-item>
            <el-input v-model="form.funcPerms" placeholder="请输入权限标识" maxlength="100" />
            <template #label>
              <span class="flex items-center">
                 <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                     <el-icon><QuestionFilled /></el-icon>
                 </el-tooltip>
                 权限字符
              </span>
            </template>
          </el-form-item>
          <el-form-item>
            <template #label>
            <span class="flex items-center">
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
              <span class="flex items-center">
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
import SelectIcon from '@/components/SelectIcon/index.vue'
import { menuStatus, getAllMenuList, deleteMenu, updateMenu, addMenu } from '@/api/system/menu'
import { parseTime } from '@/utils/tool'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllRole } from '@/api/system/role'

const loading = ref(false)
const refreshTable = ref(true)
const isExpandAll = ref(false)
const isEdit = ref(false)
const editModalVisible = ref(false)
const title = ref('')
const ids = ref([])
const menuFormRef = ref()

const form = ref({})
const rules = {
  menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '排序序号不能为空', trigger: 'blur' }]
}

const reset = () => {
  form.value = {}
  if (menuFormRef.value) menuFormRef.value.resetFields()
}
const showSelectIcon = () => {}
const selected = (name) => {}
const submitForm = () => {
  console.log(form.value)
  menuFormRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.menuId) {
        await updateMenu(form.value)
        ElMessage({ type: 'success', message: '修改成功!' })
      } else {
        await addMenu({ ...form.value })
        ElMessage({ type: 'success', message: '新增成功!' })
      }
      editModalVisible.value = false
      await getList()
    }
  })
}

const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
const handleUpdate = (rowData) => {
  isEdit.value = true
  title.value = '编辑菜单'
  editModalVisible.value = true
  form.value = rowData
}
const addDefaultValue = ref({
  type: 1,
  status: 0,
  isOutChain: 0,
  isShow: 1,
  perms: ''
})
const handleAdd = async (rowData) => {
  isEdit.value = false
  reset()
  form.value = { parentId: rowData.menuId, ...addDefaultValue.value }
  editModalVisible.value = true
  title.value = '新增菜单'
}

const handleDelete = (rowData:any = {}) => {
  const menuIds = rowData.menuId ? [rowData.menuId] : ids.value
  const deleteIds = menuIds.map((item) => {
    return { id: item }
  })
  ElMessageBox.confirm(`是否删除菜单ID为【${menuIds}】的数据?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteMenu(deleteIds)
    ElMessage({ type: 'success', message: '删除成功!' })
    await getList()
  })
}

const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.menuId)
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
