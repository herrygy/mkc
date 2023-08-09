<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form class="c-form-inline" ref="queryRef"
               :model="queryParams"
               :inline="true" label-width="68px">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-20px">
          <el-form-item class="col-span-1" label="渠道名称" prop="name">
            <el-input v-model="queryParams.name"
                      clearable placeholder="请输入渠道名称"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="状态" prop="status">
            <el-select class="w-full" v-model="queryParams.status"
                       placeholder="用户状态" clearable>
              <el-option v-for="dict in channelStatus" :key="dict.value"
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
      <div class="mb-10px">
        <el-button v-auth="['payment_addOrUpdate']" type="primary" :icon="CirclePlus" @click="handleAdd">新增</el-button>
<!--        <el-button v-auth="['payment_addOrUpdate']" type="primary" :icon="EditPen" plain-->
<!--                   :disabled="ids.length!==1" @click="handleUpdate">修改</el-button>-->
<!--        <el-button v-auth="['payment_delete']" type="primary" :icon="Delete" plain-->
<!--                   :disabled="ids.length===0" @click="handleDelete">删除</el-button>-->
      </div>
      <!-- 表格数据 -->
      <el-table v-loading="loading" :data="channelList" @selection-change="handleSelectionChange">
<!--        <el-table-column type="selection" width="55" align="center" />-->
        <el-table-column label="ID" prop="id" width="120" />
        <el-table-column label="渠道名称" prop="name" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="渠道标识" prop="identifier" width="150" />
        <el-table-column label="描述信息" prop="desc" :show-overflow-tooltip="true" width="150" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row['createdAt']) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="160">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['payment_addOrUpdate']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-auth="['payment_delete']"></el-button>
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

    <!-- 添加或修改用户配置对话框 -->
    <el-drawer :title="title" v-model="editModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="channelRef" label-width="80px">
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="form.name"
                    placeholder="请输入渠道名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="渠道标识" prop="identifier">
          <el-input v-model="form.identifier"
                    placeholder="请输入用户名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="描述信息" prop="desc">
          <el-input v-model="form.desc"
                    placeholder="请输入用户名称" maxlength="120" />
        </el-form-item>
      </el-form>
      <div class="flex justify-center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="editModalVisible=false">取 消</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import { getAllRole } from '@/api/system/role'
import { channelStatus, getChannelList, deleteChannel, addOrUpdateChannel } from '@/api/system/channel'
import { CirclePlus, Delete, EditPen } from '@element-plus/icons-vue'
import { parseTime } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const showSearch = ref(true)
const loading = ref(false)
const title = ref('')
const form = ref<any>({})
const roleOptions = ref([])
const editModalVisible = ref(false)
const channelRef = ref<any>()
const ids = ref([])

const rules = {
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  identifier: [{ required: true, message: '标识不能为空', trigger: 'blur' }],
  desc: [{ required: true, message: '描述不能为空', trigger: 'blur' }]
}

const handleAdd = async () => {
  reset()
  form.value.status = 0
  const { result } = await getAllRole()
  roleOptions.value = result
  editModalVisible.value = true
  title.value = '新增渠道'
}

const handleUpdate = async (rowData) => {
  title.value = '编辑渠道'
  editModalVisible.value = true
  form.value = { ...rowData, createdAt: undefined }
}

const reset = () => {
  form.value = {}
  if (channelRef.value) channelRef.value.resetFields()
}

const submitForm = async () => {
  channelRef.value.validate(async (valid) => {
    if (valid) {
      await addOrUpdateChannel(form.value)
      editModalVisible.value = false
      await getList()
    }
  })
}

const handleDelete = (rowData:any = {}) => {
  ElMessageBox.confirm(`是否删除名为 ${rowData.name} 的渠道?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteChannel({ id: rowData.id })
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
const channelList = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getChannelList(queryParams)
  loading.value = false
  channelList.value = result.list
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
