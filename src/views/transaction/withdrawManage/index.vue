<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form ref="queryRef" class="c-form-inline"
               :model="queryParams" :inline="true"
               label-width="68px">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-20px">
<!--          <el-form-item class="col-span-1" label="订单号" prop="orderNo">-->
<!--            <el-input v-model="queryParams.orderNo"-->
<!--                      clearable placeholder="请输入订单号"-->
<!--                      @keyup.enter="handleQuery" />-->
<!--          </el-form-item>-->
          <el-form-item class="col-span-1" label="时间">
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
        <el-button v-auth="['withdrawIndentApply_saveOrUpdate']" type="primary" icon="Plus"
                   @click="handleAdd">提现申请</el-button>
      </div>
      <el-table v-loading="loading" :data="txList">
        <el-table-column label="ID" prop="id" width="60" />
        <el-table-column label="订单号" prop="orderNo" width="120" />
        <el-table-column label="处理状态" prop="dealState" width="120" >
          <template #default="scope">
            <div>{{scope.row['dealState']===0?'待处理':'已处理'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="amount" width="120" />
        <el-table-column label="收款人" prop="name" width="120" />
        <el-table-column label="渠道类型" prop="channelType" width="120" />
        <el-table-column label="收款银行帐号" prop="accountNumber" width="120" />
        <el-table-column label="Branch Code" prop="branchCode" width="120" />
        <el-table-column label="Bank code" prop="bankCode" width="120" />
        <el-table-column label="TaxId" prop="taxId" width="120" />
        <el-table-column label="App_key" prop="appKey" width="120" :show-overflow-tooltip="true"/>
        <el-table-column label="用户ID" prop="userId" width="120" />
        <el-table-column label="描述信息" prop="description" width="120" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="逻辑删除" prop="isDeleted" width="120" >
          <template #default="scope">
            <div>{{!scope.row['isDeleted']||scope.row['isDeleted']===0?'未删除':'删除'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="错误信息" prop="errMsg" width="120" />
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="120">
          <template #default="scope">
<!--            <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">-->
<!--              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['withdrawIndentApply_saveOrUpdate']"></el-button>-->
<!--            </el-tooltip>-->
            <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-auth="['withdrawIndentApply_delete']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-show="total > 0" :total="total"
                  v-model:page="queryParams.currentPage"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getList" />
    </div>

    <!-- 修改提现信息 -->
    <el-drawer :title="title" v-model="editModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form['amount']"
                           :min="0" :precision="2"
                           class="flex-1"/>
        </el-form-item>
        <el-form-item label="账户号码" prop="accountNumber">
          <el-input v-model="form['accountNumber']"
                    placeholder="请输入账户号码" maxlength="30" />
        </el-form-item>
        <el-form-item label="银行预留名" prop="name">
          <el-input v-model="form['name']" />
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelType">
          <el-select v-model="form['channelType']" value-key="identifier"
                     placeholder="Select" :teleported="false">
            <el-option v-for="item of channelOptions" :key="item.id"
                       :label="item.name"
                       :value="item.identifier" />
          </el-select>
        </el-form-item>
        <el-form-item label="Bank Code" prop="bankCode">
          <el-input v-model="form['bankCode']" />
        </el-form-item>
        <el-form-item label="Branch Code" prop="branchCode">
          <el-input v-model="form['branchCode']" />
        </el-form-item>
        <el-form-item label="TaxId" prop="taxId">
          <el-input v-model="form['taxId']" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form['description']" type="textarea" maxlength="120"/>
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
import { reactive, ref } from 'vue'
import { getWithdrawList, updateTxInfo, deleteTx } from '@/api/transaction/withdraw'
import { parseTime } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChannelSelect } from '@/composables/useChannelSelect'

const { channelOptions, getChannelOptions } = useChannelSelect()
const showSearch = ref(true)
const loading = ref(false)
const title = ref('')
const form = ref<any>({})
const editModalVisible = ref(false)
const userRef = ref()
const isEdit = ref(false)

const rules = {
  accountNumber: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '银行预留名称不能为空', trigger: 'blur' }],
  channelType: [{ required: true, message: '渠道类型不能为空', trigger: 'blur' }]
}

const handleAdd = async () => {
  reset()
  editModalVisible.value = true
  title.value = '新增'
  await getChannelOptions()
}

const handleUpdate = async (rowData) => {
  reset()
  isEdit.value = true
  title.value = '编辑'
  editModalVisible.value = true
  const { createTime, dealState, errMsg, isDeleted, updateTime, ...newData } = rowData
  form.value = newData
  await getChannelOptions()
}

const reset = () => {
  form.value = {}
  if (userRef.value) userRef.value.resetFields()
}

const submitForm = async () => {
  userRef.value.validate(async (valid) => {
    if (valid) {
      await updateTxInfo(form.value)
      ElMessage({ type: 'success', message: '修改成功!' })
      editModalVisible.value = false
      await getList()
    }
  })
}

const handleDelete = (rowData:any = {}) => {
  ElMessageBox.confirm(`是否删除交易ID为 ${rowData.id} 的数据?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteTx({ id: rowData.id })
    ElMessage({
      type: 'success',
      message: '删除成功!'
    })
    await getList()
  })
}

const total = ref(0)
const dateRange = ref([])
const queryParams = reactive({
  currentPage: 1,
  pageSize: 20,
  endTime: undefined,
  startTime: undefined,
  orderNo: undefined
})
const txList = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getWithdrawList(queryParams)
  loading.value = false
  txList.value = result.list
  total.value = result.page.totalRows
  // await getChannelOptions()
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
