<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form ref="queryRef" class="c-form-inline"
               :model="queryParams" :inline="true"
               label-width="68px">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-20px">
          <el-form-item class="col-span-1" label="用户名称" prop="userName">
            <el-input v-model="queryParams.userName"
                      clearable placeholder="请输入用户名称"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="状态" prop="status">
            <el-select class="w-full" v-model="queryParams.status"
                       placeholder="用户状态" clearable>
              <el-option v-for="dict in userStatus" :key="dict.value"
                         :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

        </div>
      </el-form>
    </div>
    <div class="card">
      <div class="mb-10px">
        <el-button v-auth="['sysUser_addProxy']" type="primary" :icon="CirclePlus" @click="handleAdd">新增</el-button>
      </div>
      <!-- 表格数据 -->
      <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
        <!--      <el-table-column type="selection" width="55" align="center" />-->
        <el-table-column label="用户ID" prop="userId" width="120" />
        <el-table-column label="用户名称" prop="userName" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="用户角色" prop="roleList"  width="150" >
          <template #default="scope">
            <div v-for="role of scope.row['roleList']" :key="role.roleId">{{role.roleName}}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="0"
              :inactive-value="1"
              disabled
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="160">
        </el-table-column>
      </el-table>
      <Pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.currentPage"
        v-model:limit="queryParams.pageSize"
        @pagination="getList" />
    </div>

    <!-- 添加或修改用户配置对话框 -->
    <el-drawer :title="title" v-model="editModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="form.userName"
                    placeholder="请输入用户名称" maxlength="30" />
        </el-form-item>
        <el-form-item v-if="!form.userId" label="用户密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入用户密码"
                    type="password" maxlength="16" show-password />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in userStatus"
              :key="dict.value"
              :label="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelType">
          <el-select v-model="form.channelType" value-key="id"
                     placeholder="Select" :teleported="false">
            <el-option v-for="item of channelOptions" :key="item.id"
                       :label="item.name"
                       :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单笔最大充值" prop="perMaxRecharge">
          <el-input-number class="w-full" v-model="form.perMaxRecharge" :min="0"/>
        </el-form-item>
        <el-form-item label="单笔最小充值" prop="perMinRecharge">
          <el-input-number v-model="form.perMinRecharge" :min="0"/>
        </el-form-item>
        <el-form-item label="每笔充值手续费" prop="perRechargeFee">
          <el-input-number v-model="form.perRechargeFee" :min="0"/>
        </el-form-item>
        <el-form-item label="每笔充值千分比" prop="perRechargeFeeRate">
          <el-input-number v-model="form.perRechargeFeeRate" :min="0" :step="1"/>
        </el-form-item>
        <el-form-item label="单笔最大提现" prop="perMaxWithdraw">
          <el-input-number v-model="form.perMaxWithdraw" :min="0"/>
        </el-form-item>
        <el-form-item label="单笔最小提现" prop="perMinWithdraw">
          <el-input-number v-model="form.perMinWithdraw" :min="0"/>
        </el-form-item>
        <el-form-item label="每笔提现手续费" prop="perWithdrawFee">
          <el-input-number v-model="form.perWithdrawFee" :min="0"/>
        </el-form-item>
        <el-form-item label="每笔提现千分比" prop="perWithdrawFeeRate">
          <el-input-number v-model="form.perWithdrawFeeRate" :min="0"/>
        </el-form-item>

      </el-form>
      <div class="flex justify-center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="editModalVisible=false">取 消</el-button>
      </div>
    </el-drawer>
    <el-drawer title="分配角色" class="el-bg-color" v-model="authRoleVisible" :destroy-on-close="true" size="450px">
      <AuthRole :form="form"
                :selected-role-list="currentAuthRoleList"
                @update="authRoleVisible=false,getList"></AuthRole>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { getAllRole } from '@/api/system/role'
import { userStatus, getProxyList, addNewProxy, updateUser, checkUserName, deleteUser, resetPwd } from '@/api/system/user'
import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh } from '@element-plus/icons-vue'
import { parseTime } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import md5 from 'js-md5'
import AuthRole from './authRole.vue'

const showSearch = ref(true)
const loading = ref(false)
const multiple = ref(false)
const title = ref('')
const form = ref<any>({})
const roleOptions = ref([])
const editModalVisible = ref(false)
const userRef = ref()
const ids = ref([])
const isEdit = ref(false)
const isShowSearch = ref(true)

const validateUserName = async (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('用户名不能为空'))
  } else if (!isEdit.value) {
    const { code, message } = await checkUserName({ userName: value })
    if (code !== 200) callback(new Error(message))
  } else {
    callback()
  }
}

const rules = {
  userName: [{ required: true, validator: validateUserName, trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
}

const handleAdd = async () => {
  reset()
  form.value.status = 0
  const { result } = await getAllRole()
  roleOptions.value = result
  editModalVisible.value = true
  title.value = '新增代理'
}

const handleUpdate = async (rowData) => {
  title.value = '编辑用户'
  editModalVisible.value = true
  const { result } = await getAllRole()
  roleOptions.value = result
  form.value = { userName: rowData.userName, status: rowData.status, userId: rowData.userId }
  form.value.roleIds = rowData.roleList.map((item) => {
    return item.roleId
  })
}

const handleResetPwd = async (rowData) => {
  ElMessageBox.prompt(`请输入用户【${rowData.userName}】的新密码`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    closeOnClickModal: false,
    inputPattern: /^.{6,16}$/,
    inputErrorMessage: '用户密码长度6-16位'
  }).then(async ({ value }) => {
    await resetPwd({ userId: rowData.userId, password: md5(value) })
    ElMessage({ type: 'success', message: '修改成功!' })
  }).catch(() => {})
}

const reset = () => {
  form.value = {}
  if (userRef.value) userRef.value.resetFields()
}

const submitForm = async () => {
  userRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.userId) {
        await updateUser(form.value)
        ElMessage({ type: 'success', message: '修改成功!' })
      } else {
        await addNewProxy({ ...form.value, password: md5(form.value.password) })
        ElMessage({ type: 'success', message: '新增成功!' })
      }
      editModalVisible.value = false
      await getList()
    }
  })
}

const handleDelete = (rowData:any = {}) => {
  const userIds = rowData.userId ? [rowData.userId] : ids.value
  const deleteIds = userIds.map((item) => {
    return { id: item }
  })
  ElMessageBox.confirm(`是否删除用户ID为 ${userIds} 的数据?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteUser(deleteIds)
    ElMessage({
      type: 'success',
      message: '删除成功!'
    })
    await getList()
  })
}
const handleExport = () => {}

const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.userId)
}
const handleStatusChange = (rowData) => {
  const text = rowData.status === '0' ? '启用' : '停用'
  ElMessageBox.confirm(`确认要${text}用户名为【${rowData.userName}】的用户吗?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    console.log(rowData)
    await updateUser({ status: rowData.status, userId: rowData.userId, userName: rowData.userName })
    ElMessage({ type: 'success', message: '修改成功!' })
    await getList()
  }).catch(() => {
    rowData.status = rowData.status === 0 ? 1 : 0
  })
}

const handleDataScope = (data = {}) => {}

const authRoleVisible = ref(false)
const currentAuthRoleList = ref([])
const handleAuthRole = (rowData:any) => {
  authRoleVisible.value = true
  form.value = { userName: rowData.userName, status: rowData.status, userId: rowData.userId }
  form.value.roleIds = rowData.roleList.map((item) => {
    return item.roleId
  })
  currentAuthRoleList.value = rowData.roleList
}

const total = ref(0)
const dateRange = ref([])
const queryParams = reactive({
  currentPage: 1,
  pageSize: 20,
  endTime: undefined,
  userName: undefined,
  startTime: undefined,
  status: undefined
})
const roleList = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getProxyList(queryParams)
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
