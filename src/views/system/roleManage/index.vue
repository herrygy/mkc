<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form ref="queryRef" class="c-form-inline"
               :model="queryParams" :inline="true"
               label-width="68px">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-20px">
          <el-form-item class="col-span-1" label="用户名称" prop="name">
            <el-input v-model="queryParams.name"
                      clearable placeholder="请输入角色名称"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="状态" prop="status">
            <el-select class="w-full" v-model="queryParams.status"
                       placeholder="角色状态" clearable>
              <el-option v-for="dict in roleStatus" :key="dict.value"
                         :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="col-span-1" label="创建时间">
            <el-date-picker class="w-full"
                            v-model="dateRange"
                            value-format="YYYY-MM-DD"
                            type="daterange"
                            range-separator="-"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <div class="col-span-1 flex justify-end">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </div>
        </div>
      </el-form>
    </div>
    <div class="card">
<!--      <div class="mb-10px">-->
<!--        <el-button v-auth="['sysRole_add']" type="primary" :icon="CirclePlus" @click="handleAdd">新增</el-button>-->
<!--        <el-button v-auth="['sysRole_edit']" type="primary" :icon="EditPen" plain-->
<!--                   :disabled="ids.length!==1" @click="handleUpdate">修改</el-button>-->
<!--        <el-button v-auth="['sysRole_delete']" type="primary" :icon="Delete" plain-->
<!--                   :disabled="ids.length===0" @click="handleDelete">删除</el-button>-->
<!--      </div>-->
      <!-- 表格数据 -->
      <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
<!--        <el-table-column type="selection" width="55" align="center" />-->
        <el-table-column label="角色ID" prop="roleId" width="120" />
        <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="显示顺序" prop="roleSort" width="100" />
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <span v-if="scope.row.roleStatus ===0">正常</span>
            <span v-else class="text-red-500">停用</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="160">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" :show-after="500">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['sysRole_edit']"></el-button>
            </el-tooltip>
<!--            <el-tooltip content="删除" placement="top" :show-after="500">-->
<!--              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-auth="['sysRole_delete']"></el-button>-->
<!--            </el-tooltip>-->
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-show="total > 0" :total="total"
                  v-model:page="queryParams.currentPage"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getList" />
    </div>
    <el-drawer :title="title" v-model="editVisible" :destroy-on-close="true" size="600px">
      <div class="w-full overflow-auto">
        <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="form.roleName" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="角色顺序" prop="roleSort">
            <el-input-number v-model="form['roleSort']" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="form['roleStatus']">
              <el-radio
                v-for="dict in roleStatus"
                :key="dict.value"
                :label="dict.value"
              >{{ dict.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单权限">
            <div class="flex flex-col">
              <div>
                <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event)">展开/折叠</el-checkbox>
                <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event)">全选/全不选</el-checkbox>
                <el-checkbox v-model="menuCheckStrictly" @change="handleCheckedTreeConnect($event)">父子联动</el-checkbox>
              </div>
              <el-tree
                class="tree-border"
                :data="menuOptions"
                :default-expand-all="menuExpand"
                :default-checked-keys="menuCheckedKeys"
                :default-expanded-keys="menuExpandKeys"
                show-checkbox
                ref="menuRef"
                node-key="menuId"
                :check-strictly="!menuCheckStrictly"
                empty-text="加载中，请稍候"
                :props="{ label: 'menuName', children: 'children' }"
              ></el-tree>
            </div>
          </el-form-item>
          <!--        <el-form-item label="备注">-->
          <!--          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>-->
          <!--        </el-form-item>-->
        </el-form>
        <div class="flex justify-center">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="editVisible=false">取 消</el-button>
        </div>
      </div>

    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { roleStatus, getRoleList, getRoleInfoById, updateRole, addRole, deleteRole } from '@/api/system/role'
import { getAllMenuList } from '@/api/system/menu'
import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh } from '@element-plus/icons-vue'
import { parseTime } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const showSearch = ref(true)
const loading = ref(false)
const multiple = ref(false)
const title = ref('')
const rules = {
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
}
const editVisible = ref(false)
const handleAdd = async () => {
  reset()
  form.value.roleStatus = 0
  const { result } = await getAllMenuList()
  menuOptions.value = result
  editVisible.value = true
  title.value = '添加角色'
}

const form = ref<any>({})
const menuRef = ref<any>(null)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const menuCheckStrictly = ref(false)
const menuOptions = ref([])
const menuCheckedKeys = ref([])
const menuExpandKeys = ref([])

const handleCheckedTreeExpand = (value) => {
  const treeList = menuOptions.value
  for (let i = 0; i < treeList.length; i++) {
    menuRef.value.store.nodesMap[treeList[i].menuId].expanded = value
  }
}
const handleCheckedTreeNodeAll = (value) => {
  menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
}
const handleCheckedTreeConnect = (value) => {
  menuCheckStrictly.value = value
}

const reset = () => {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  form.value = {}
  if (roleRef.value) roleRef.value.resetFields()
}

/** 所有菜单节点数据 */
const getMenuAllCheckedKeys = () => {
  // 目前被选中的菜单节点
  const checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  const halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}

const roleRef = ref()
const submitForm = async () => {
  roleRef.value.validate(valid => {
    console.log(valid)
    const selectedMenuIds = getMenuAllCheckedKeys()
    console.log(selectedMenuIds)
    if (form.value.roleId) {
      updateRole({
        ...form.value,
        menuIds: selectedMenuIds
      }).then(response => {
        ElMessage({ type: 'success', message: '修改成功!' })
        editVisible.value = false
        getList()
      })
    } else {
      addRole({
        ...form.value,
        menuIds: selectedMenuIds
      }).then(response => {
        ElMessage({ type: 'success', message: '新增成功!' })
        editVisible.value = false
        getList()
      })
    }
  })
}

const handleUpdate = async (rowData) => {
  editVisible.value = true
  const { result } = await getRoleInfoById({ id: rowData.roleId })
  menuOptions.value = result.menuList
  menuCheckedKeys.value = result.selfMenuIds
  form.value = result.adminRoleDTO
}

const handleDelete = (rowData:any = {}) => {
  const roleIds = rowData.roleId ? [rowData.roleId] : ids.value
  const deleteIds = roleIds.map((item) => {
    return { id: item }
  })
  ElMessageBox.confirm(`是否删除角色ID为 ${roleIds} 的数据?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteRole(deleteIds)
    ElMessage({
      type: 'success',
      message: '删除成功!'
    })
    await getList()
  })
}
const handleExport = () => {}
const ids = ref([])
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.roleId)
}
const handleStatusChange = (rowData) => {
  const text = rowData.roleStatus === '0' ? '启用' : '停用'
  ElMessageBox.confirm(`确认要${text} ${rowData.roleName} 角色吗?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    console.log(rowData)
    await updateRole({ roleStatus: rowData.roleStatus, roleId: rowData.roleId })
    ElMessage({
      type: 'success',
      message: '修改成功!'
    })
    await getList()
  })
}

const handleDataScope = (data = {}) => {}
const handleAuthUser = (data = {}) => {}

const total = ref(0)
const dateRange = ref([])
const queryParams = reactive({
  currentPage: 1,
  pageSize: 20,
  endTime: undefined,
  name: undefined,
  startTime: undefined,
  status: undefined
})
const roleList = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getRoleList(queryParams)
  loading.value = false
  roleList.value = result.list
  total.value = result.page.totalRows
}
const handleQuery = () => {
  queryParams.currentPage = 1
  queryParams.startTime = undefined
  queryParams.endTime = undefined
  if (dateRange.value && dateRange.value.length === 2) [queryParams.startTime, queryParams.endTime] = dateRange.value
  getList()
}
const queryRef = ref()
const resetQuery = () => {
  dateRange.value = []
  queryParams.startTime = undefined
  queryParams.endTime = undefined
  queryRef.value.resetFields()
  queryParams.currentPage = 1
  getList()
}

getList()
</script>

<style scoped></style>
