<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form ref="queryRef" class="c-form-inline"
               :model="queryParams" :inline="true"
               label-width="68px">
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-20px">
          <el-form-item v-if="!userStore.userInfo.appKey"
                        class="col-span-1" label="商户号" prop="proxyNo">
            <el-input v-model="queryParams.proxyNo"
                      clearable placeholder="请输入商户号"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="订单号" prop="orderNo">
            <el-input v-model="queryParams.orderNo"
                      clearable placeholder="请输入订单号"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="提现状态" prop="status">
            <el-select class="w-full" v-model="queryParams.state"
                       placeholder="提现状态" clearable>
              <el-option v-for="dict in withdrawStatus" :key="dict.value"
                         :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="col-span-1" label="创建时间">
            <el-date-picker class="w-full"
                            v-model="dateRange"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY/MM/DD HH:mm:ss"
                            type="daterange"
                            range-separator="-"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"></el-date-picker>
          </el-form-item>
          <div class="flex justify-end" :class="userStore.userInfo.appKey?'col-span-1':'col-span-1 md:col-span-2'">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </div>
        </div>
      </el-form>
    </div>
    <div class="card">
      <div class="mb-10px">
        <el-button v-auth="['withdrawIndent_export']"
                   type="primary" icon="Download"
                   :disabled="txList.length===0"
                   @click="handleExport">导出</el-button>
      </div>
      <el-table v-loading="loading" :data="txList">
        <el-table-column v-if="!userStore.userInfo.appKey" label="商户号" prop="proxyNo" width="120" />
        <el-table-column label="订单号" prop="orderNo" width="200" :show-overflow-tooltip="true"/>
        <el-table-column label="下游订单号" prop="externalOrderNo" width="200" :show-overflow-tooltip="true" />
        <el-table-column label="金额" prop="amount" width="120" >
          <template #default="scope">
            {{fixedNumber(scope.row['amount']/100)}}
          </template>
        </el-table-column>
        <el-table-column label="货币" prop="currency" width="120" />
        <el-table-column label="提现状态" prop="state" width="120" >
          <template #default="scope">
            <el-tag v-if="scope.row.state==='created'" type="info">创建中</el-tag>
            <el-tag v-if="scope.row.state==='canceled'" type="info">已取消</el-tag>
            <el-tag v-if="scope.row.state==='success'" type="success">成功</el-tag>
            <el-tag v-if="scope.row.state==='failed'" type="danger">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="渠道类型" prop="channelType" width="120" >
          <template #default="scope">
            {{channelMap[scope.row['channelType']]}}
          </template>
        </el-table-column>
        <el-table-column label="平台手续费" prop="fee" width="120" >
          <template #default="scope">
            {{fixedNumber(scope.row['fee']/100)}}
          </template>
        </el-table-column>
        <el-table-column label="收款人" prop="name" width="200" :show-overflow-tooltip="true"/>
        <el-table-column label="收款银行帐号" prop="accountNumber" width="120" :show-overflow-tooltip="true"/>
        <el-table-column label="Branch Code" prop="branchCode" width="120" />
        <el-table-column label="Bank code" prop="bankCode" width="120" />
        <el-table-column label="TaxId" prop="taxId" width="120" />
        <el-table-column label="下单时间" align="center" prop="oderTime" width="200">
          <template #default="scope">
            <span>{{ formatBrazilTime(scope.row['oderTime']) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述信息" prop="description" width="120" />
        <el-table-column  label="操作" align="center"
                         class-name="small-padding" fixed="right" width="120">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" :show-after="500">
              <el-button v-if="scope.row.roleId !== 1"
                         link type="primary" icon="Edit"
                         @click="handleUpdate(scope.row)"
                         v-auth="['withdrawIndent_editState']"></el-button>
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
    <el-drawer title="修改" v-model="editModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form['orderNo']" disabled/>
        </el-form-item>
        <el-form-item label="提现金额" prop="amount">
          <el-input-number :model-value="fixedNumber(form['amount']/100)"
                           class="flex-1" disabled/>
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelType">
          <el-select v-model="form['channelType']" value-key="identifier"
                     placeholder="Select" :teleported="false" disabled>
            <el-option v-for="item of channelOptions" :key="item.identifier"
                       :label="item.name"
                       :value="item.identifier" />
          </el-select>
        </el-form-item>
        <el-form-item label="提现状态" prop="channelType">
          <el-select v-model="form['state']"
                     placeholder="Select" :teleported="false">
            <el-option v-for="item of withdrawStatus" :key="item.value"
                       :label="item.label"
                       :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="flex justify-center">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="editModalVisible=false">取 消</el-button>
      </div>
    </el-drawer>
    <!-- 新增提现申请 -->
    <el-drawer title="新增提现申请" v-model="addModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <el-form-item label="提现类型" prop="amount" v-if="!isEdit">
          <el-radio-group v-model="form['type']" class="ml-4" @change="typeChange">
            <el-radio :label="0">银行</el-radio>
            <el-radio :label="1">Pix</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="ml-120px">
          <div class="text-12px text-colorF5 leading-18px">
            *当前最小充值额度：{{proxyUserInfo['perMinWithdraw']}} <br>
            *当前最大充值额度：{{proxyUserInfo['perMaxWithdraw']}}
          </div>
        </div>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form['amount']"
                           :min="proxyUserInfo['perMinWithdraw'] || 0"
                           :max="proxyUserInfo['perMaxWithdraw'] || Infinity"
                           :step="1" :precision="2"
                           class="flex-1"/>
        </el-form-item>
        <template v-if="form.type===0">
          <el-form-item label="渠道类型" prop="channelType">
            <el-input v-model="form['channelType']" disabled/>
          </el-form-item>
          <el-form-item label="账户号码" prop="accountNumber">
            <el-input v-model="form['accountNumber']"
                      placeholder="请输入账户号码" maxlength="30" />
          </el-form-item>
          <el-form-item label="银行预留名" prop="name">
            <el-input v-model="form['name']" />
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
        </template>
        <template v-if="form.type===1">
          <el-form-item label="Pix" prop="taxId">
            <el-input v-model="form['pix']" />
          </el-form-item>
        </template>
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
import { withdrawStatus, getWithdrawList, updateTxState, deleteTx, addWithdraw, exportData } from '@/api/order/withdraw'
import { formatBrazilTime, fixedNumber, formatLocalTimeToUTC } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox, dayjs } from 'element-plus'
import { useChannelSelect } from '@/composables/useChannelSelect'
import { useProxyUser } from '@/composables/useProxyUser'
import { useUserStore } from '@/stores/modules/user'
import { useDownload } from '@/hooks/useDownload'

const userStore = useUserStore()
const { proxyUserInfo, getProxyUserInfo } = useProxyUser()
const { channelOptions, channelMap, getChannelOptions } = useChannelSelect()
const showSearch = ref(true)
const loading = ref(false)
const form = ref<any>({})
const editModalVisible = ref(false)
const addModalVisible = ref(false)
const userRef = ref()
const isEdit = ref(false)

const rules = {
  type: [{ required: true, message: '选择提现类型', trigger: 'blur' }],
  accountNumber: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
  amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '银行预留名称不能为空', trigger: 'blur' }],
  channelType: [{ required: true, message: '渠道类型不能为空', trigger: 'blur' }],
  bankCode: [{ required: true, message: 'Bank Code不能为空', trigger: 'blur' }],
  branchCode: [{ required: true, message: 'Branch Code不能为空', trigger: 'blur' }],
  taxId: [{ required: true, message: 'TaxId不能为空', trigger: 'blur' }],
  pix: [{ required: true, message: 'Pix码不能为空', trigger: 'blur' }]
}

const typeChange = (value) => {
  reset()
  form.value.type = value
  form.value.channelType = proxyUserInfo.value.channelType
}

const handleAdd = async () => {
  reset()
  addModalVisible.value = true
  form.value.type = 0
  await getProxyUserInfo()
  form.value.channelType = proxyUserInfo.value.channelType
}

const handleUpdate = async (rowData) => {
  reset()
  editModalVisible.value = true
  form.value = { ...rowData }
}

const reset = () => {
  form.value = {}
  if (userRef.value) userRef.value.resetFields()
}

const submitForm = async () => {
  userRef.value.validate(async (valid) => {
    if (valid) {
      if (form.value.id) {
        await updateTxState({
          id: form.value.id,
          state: form.value.state,
          appKey: form.value.appKey
        })
        ElMessage({ type: 'success', message: '修改成功!' })
        editModalVisible.value = false
        await getList()
      } else {
        await addWithdraw(form.value)
        ElMessage({ type: 'success', message: '新增成功!' })
        addModalVisible.value = false
        await getList()
      }
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
  pageSize: 15,
  endTime: undefined,
  startTime: undefined,
  orderNo: undefined,
  proxyNo: undefined,
  state: undefined
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
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTime = formatLocalTimeToUTC(dateRange.value[0]) as any
    queryParams.endTime = formatLocalTimeToUTC(dateRange.value[1]) as any
  }
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

const getData = async () => {
  await getChannelOptions()
  await getList()
}

const handleExport = async () => {
  await useDownload(
    exportData,
    '代收订单',
    queryParams,
    false
  )
}

getData()
</script>

<style scoped></style>
