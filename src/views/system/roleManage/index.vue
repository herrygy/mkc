<template>
  <div>
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="queryParams.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
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
      <el-button v-auth="['system:role:edit']" type="primary" :icon="EditPen" plain :disabled="multiple" @click="handleUpdate">修改</el-button>
      <el-button v-auth="['system:role:edit']" type="primary" :icon="Delete" plain :disabled="multiple" @click="handleDelete">删除</el-button>
      <el-button v-auth="['system:role:edit']" type="primary" :icon="Download" plain @click="handleExport">导出用户数据</el-button>
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
          <el-switch
            v-model="scope.row.roleStatus"
            :active-value="0"
            :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:role:remove']"></el-button>
          </el-tooltip>
          <el-tooltip content="数据权限" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="CircleCheck" @click="handleDataScope(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="分配用户" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
            <el-button link type="primary" icon="User" @click="handleAuthUser(scope.row)" v-hasPermi="['system:role:edit']"></el-button>
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
  </div>
</template>

<script setup>
import { reactive, ref, toRefs } from 'vue'
import { roleStatus, getRoleList } from '@/api/system/role.js'
import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh } from '@element-plus/icons-vue'
import { parseTime } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'

const showSearch = ref(true)
const loading = ref(false)
const multiple = ref(false)

const data = reactive({
  form: {},

  rules: {
    roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
  }
})
const dateRange = ref([])

const handleQuery = () => {}
const resetQuery = () => {}
const handleAdd = () => {}
const handleUpdate = (data = {}) => {}
const handleDelete = (data = {}) => {}
const handleExport = () => {}
const handleSelectionChange = () => {}
const handleStatusChange = (data = {}) => {}
const handleDataScope = (data = {}) => {}
const handleAuthUser = (data = {}) => {}

const total = ref(0)
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
getList()
</script>

<style scoped></style>
