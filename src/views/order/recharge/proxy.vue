<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form ref="queryRef" class="c-form-inline"
               :model="queryParams" :inline="true"
               label-width="68px">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-20px">
          <el-form-item class="col-span-1" label="订单号" prop="orderNo">
            <el-input v-model="queryParams.orderNo"
                      clearable placeholder="请输入订单号"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="充值状态" prop="status">
            <el-select class="w-full" v-model="queryParams.state"
                       placeholder="充值状态" clearable>
              <el-option v-for="dict in rechargeStatus" :key="dict.value"
                         :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="col-span-1" label="时间">
            <el-date-picker class="w-full"
                            v-model="dateRange"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY/MM/DD HH:mm:ss"
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
      <el-table v-loading="loading" :data="txList">
        <el-table-column v-if="!userStore.userInfo.appKey" label="商户号" prop="proxyNo" width="120" />
        <el-table-column label="充值订单号" prop="orderNo" width="200" />
        <el-table-column label="实充值金额" prop="rechargeMoney" width="120" >
          <template #default="scope">
            {{fixedNumber(scope.row['rechargeMoney']/100)}}
          </template>
        </el-table-column>
        <el-table-column label="货币" prop="currency" width="120" />
        <el-table-column label="充值状态" prop="state" width="120" >
          <template #default="scope">
            <el-tag v-if="scope.row.state==='created'" type="info">二维码创建</el-tag>
            <el-tag v-if="scope.row.state==='processing'" type="info">支付中</el-tag>
            <el-tag v-if="scope.row.state==='success'" type="success">成功</el-tag>
            <el-tag v-if="scope.row.state==='failed'" type="danger">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="渠道类型" prop="channelType" width="120" >
          <template #default="scope">
            {{channelMap[scope.row['channelType']]}}
          </template>
        </el-table-column>
        <el-table-column label="平台手续费" prop="fee" width="120" />
        <el-table-column label="下单时间" prop="oderTime" width="200" >
          <template #default="scope">
            {{ formatBrazilTime(scope.row['oderTime']) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ formatBrazilTime(scope.row.createTime, true) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="成功时间" prop="successTime" width="200" >
          <template #default="scope">
            {{ formatBrazilTime(scope.row['successTime']) }}
          </template>
        </el-table-column>
        <el-table-column label="描述信息" prop="description" width="120" />
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="120">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['rechargeIndent_saveOrUpdate']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-auth="['rechargeIndent_delete']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-show="total > 0" :total="total"
                  v-model:page="queryParams.currentPage"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getList" />
    </div>

    <!-- 修改订单信息 -->
    <el-drawer title="编辑订单" v-model="editModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <el-form-item label="充值订单号" prop="orderNo">
          <el-input v-model="form['orderNo']" disabled/>
        </el-form-item>
        <el-form-item label="充值金额" prop="orderNo">
          <el-input :model-value="fixedNumber(form['rechargeMoney']/100)" disabled>
            <template #append>{{form['currency']}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelType">
          <el-select v-model="form['channelType']" value-key="identifier"
                     placeholder="Select" :teleported="false" disabled>
            <el-option v-for="item of channelOptions" :key="item.id"
                       :label="item.name"
                       :value="item.identifier" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值状态" prop="channelType">
          <el-select v-model="form['state']"
                     placeholder="Select" :teleported="false">
            <el-option v-for="item of rechargeStatus" :key="item.value"
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { rechargeStatus, getProxyOrderList, updateTxInfo, deleteTx } from '@/api/order/recharge'
import { parseTime, formatBrazilTime, fixedNumber, formatLocalTimeToUTC } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChannelSelect } from '@/composables/useChannelSelect'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const { channelOptions, channelMap, getChannelOptions } = useChannelSelect()
const showSearch = ref(true)
const loading = ref(false)
const form = ref<any>({})
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const userRef = ref()
const ids = ref([])

const rules = {
  rechargeMoney: [{ required: true, message: '金额不能为空', trigger: 'blur' }],
  currency: [{ required: true, message: '货币不能为空', trigger: 'blur' }],
  channelType: [{ required: true, message: '渠道类型不能为空', trigger: 'blur' }]
}

const handleAdd = async () => {
  reset()
  addModalVisible.value = true
  form.value.currency = 'BRL'
  form.value.state = 'created'
  await getChannelOptions()
}

const handleUpdate = async (rowData) => {
  reset()
  editModalVisible.value = true
  form.value = { ...rowData }
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
  pageSize: 15,
  endTime: undefined,
  startTime: undefined,
  state: undefined,
  orderNo: undefined
})
const txList = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getProxyOrderList(queryParams)
  loading.value = false
  txList.value = result.list
  total.value = result.page.totalRows
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

getList()
</script>

<style scoped></style>
