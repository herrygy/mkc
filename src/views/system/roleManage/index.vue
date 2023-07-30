<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="角色ID" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
<!--      <el-form-item label="权限字符" prop="roleKey">-->
<!--        <el-input-->
<!--          v-model="queryParams.roleKey"-->
<!--          placeholder="请输入权限字符"-->
<!--          clearable-->
<!--          style="width: 240px"-->
<!--          @keyup.enter="handleQuery"-->
<!--        />-->
<!--      </el-form-item>-->
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width: 240px">
          <el-option v-for="dict in roleStatus" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="mb-10px">
      <el-button v-auth="['system:role:add']" type="primary" :icon="CirclePlus" @click="handleAdd">新增</el-button>
      <el-button v-auth="['system:role:edit']" type="primary" :icon="EditPen" plain
                 :disabled="ids.length!==1" @click="handleUpdate">修改</el-button>
      <el-button v-auth="['system:role:edit']" type="primary" :icon="Delete" plain
                 :disabled="ids.length===0" @click="handleDelete">删除</el-button>
<!--      <el-button v-auth="['system:role:edit']" type="primary" :icon="Download" plain @click="handleExport">导出用户数据</el-button>-->
    </div>
    <!-- 表格数据 -->
    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色编号" prop="roleId" width="120" />
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150" />
<!--      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />-->
      <el-table-column label="显示顺序" prop="roleSort" width="100" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <span v-if="scope.row.roleStatus ===0">正常</span>
          <span v-else class="text-red-500">停用</span>
<!--          <el-switch-->
<!--            v-model="scope.row.roleStatus"-->
<!--            :active-value="0"-->
<!--            :inactive-value="1"-->
<!--            @change="handleStatusChange(scope.row)"-->
<!--          ></el-switch>-->
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="200">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="160">
        <template #default="scope">
          <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['system:role:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-auth="['system:role:remove']"></el-button>
          </el-tooltip>
          <el-tooltip content="数据权限" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-auth="['system:role:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="分配用户" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-auth="['system:role:edit']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.currentPage"
      v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <el-dialog :title="title" v-model="editVisible" width="500px" append-to-body
               class="max-w-600px">
      <div class="w-full max-h-60vh overflow-auto">
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
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="editVisible=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

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
const menuRef = ref(null)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const menuCheckStrictly = ref(true)
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
  const { result } = await getRoleList({ vo: queryParams })
  loading.value = false
  roleList.value = result.list
  total.value = result.page.totalRows
}
const handleQuery = () => {
  queryParams.currentPage = 1
  if (dateRange.value.length === 2) [queryParams.startTime, queryParams.endTime] = dateRange.value
  getList()
}
const queryRef = ref()
const resetQuery = () => {
  dateRange.value = []
  queryRef.value.resetFields()
}

getList()
</script>

<style scoped></style>
