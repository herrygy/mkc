<template>
  <div class="table-box">
    <div v-show="showSearch" class="card mb-5px">
      <el-form ref="queryRef" class="c-form-inline"
               :model="queryParams" :inline="true"
               label-width="90px">
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-20px">
          <el-form-item v-if="!userStore.userInfo.appKey"
                        class="col-span-1" label="商户号" prop="proxyNo">
            <el-input v-model="queryParams.proxyNo"
                      clearable placeholder="请输入商户号"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="平台订单号" prop="orderNo">
            <el-input v-model="queryParams.orderNo"
                      clearable placeholder="请输入平台订单号"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1" label="外部订单号" prop="orderNo">
            <el-input v-model="queryParams.externalOrderNo"
                      clearable placeholder="请输入外部订单号"
                      @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item class="col-span-1 " label="充值状态" prop="status">
            <el-select class="w-full" v-model="queryParams.state"
                       placeholder="充值状态" clearable>
              <el-option v-for="dict in rechargeStatus" :key="dict.value"
                         :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item class="col-span-1" label="创建时间">
            <el-date-picker class="w-full"
                            v-model="dateRange"
                            format="YYYY/MM/DD HH:mm:ss"
                            value-format="YYYY/MM/DD HH:mm:ss"
                            type="datetimerange"
                            range-separator="-"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"></el-date-picker>
          </el-form-item>
          <div class="flex justify-end" :class="userStore.userInfo.appKey?'col-span-1':'col-span-1'">
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </div>
        </div>
      </el-form>
    </div>
    <div class="card">
      <div class="mb-10px">
        <el-button v-auth="['rechargeIndent_saveOrUpdate']"
                   type="primary" icon="Plus"
                   @click="handleAdd">新增</el-button>
        <el-button v-auth="['rechargeIndent_export']"
                   type="primary" icon="Download"
                   :disabled="txList.length===0"
                   @click="handleExport">导出</el-button>
      </div>
      <el-table v-loading="loading" :data="txList">
        <el-table-column v-if="!userStore.userInfo.appKey" label="商户号" prop="proxyNo" width="120" />
        <el-table-column label="平台订单号" prop="orderNo" width="200" :show-overflow-tooltip="true" />
        <el-table-column label="外部订单号" prop="externalOrderNo" width="200" :show-overflow-tooltip="true" />
        <el-table-column label="充值金额" prop="rechargeMoney" width="120" >
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
        <el-table-column label="平台手续费" prop="fee" width="120" >
          <template #default="scope">
            {{fixedNumber(scope.row['fee']/100)}}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="left" prop="createTime" width="280">
          <template #default="scope">
            <span>{{ formatBrazilTime(scope.row.createTime, true) }} (巴西-3时区)</span> <br>
            <span>{{ parseTime(scope.row.createTime) }} (0时区)</span>
          </template>
        </el-table-column>
        <el-table-column label="成功时间" prop="successTime" width="200" >
          <template #default="scope">
            <span>{{ formatBrazilTime(scope.row['successTime']) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="描述信息" prop="description" width="120" />
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="120">
          <template #default="scope">
            <el-tooltip content="修改" placement="top" v-if="scope.row.roleId !== 1" :show-after="500">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['rechargeIndent_editState']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-show="total > 0" :total="total"
                  v-model:page="queryParams.currentPage"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getList" />
    </div>

    <!-- 新增订单信息 -->
    <el-drawer title="新增订单" v-model="addModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <div class="ml-120px">
          <div class="text-12px text-colorF5 leading-18px">
            *当前最小充值额度：{{proxyUserInfo['perMinRecharge']}} <br>
            *当前最大充值额度：{{proxyUserInfo['perMaxRecharge']}}
          </div>
        </div>
        <el-form-item label="充值金额" prop="rechargeMoney">
          <el-input-number v-model="form['rechargeMoney']"
                           :min="proxyUserInfo['perMinRecharge'] || 0"
                           :max="proxyUserInfo['perMaxRecharge'] || Infinity"
                           :step="1" :precision="2"
                           class="flex-1" />
        </el-form-item>
        <el-form-item label="货币" prop="currency">
          <el-select v-model="form['currency']"
                     placeholder="Select" :teleported="false">
            <el-option label="BRL" :value="'BRL'" />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelType">
          <el-select v-model="form['channelType']" value-key="identifier"
                     placeholder="Select" :teleported="false" disabled>
            <el-option v-for="item of channelOptions" :key="item.identifier"
                       :label="item.name"
                       :value="item.identifier" />
          </el-select>
        </el-form-item>
        <el-form-item label="充值状态" prop="channelType">
          <el-select v-model="form['state']"
                     placeholder="Select" :teleported="false" disabled>
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
    <el-dialog v-model="qrCodeModalVisible" title="收款二维码" width="350px">
      <div class="border-1 border-black/10 p-10px w-min flex items-center mx-auto my-20px">
<!--        <qrcode-vue id="qr-canvas" :value="qrCodeUrl" :size="200" background="transparent"/>-->
        <img class="w-200px h-200px min-w-200px min-h-200px" :src="qrCodeUrl" alt="">
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { rechargeStatus, getOrderList, updateTxInfo, deleteTx, updateTxState, exportData } from '@/api/order/recharge'
import { parseTime, formatBrazilTime, fixedNumber, formatLocalTimeToUTC } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChannelSelect } from '@/composables/useChannelSelect'
import { useProxyUser } from '@/composables/useProxyUser'
import { useUserStore } from '@/stores/modules/user'
import { useDownload } from '@/hooks/useDownload'
import { download } from '@/api'
import { deleteRole } from '@/api/system/role'

const userStore = useUserStore()
const { channelOptions, channelMap, getChannelOptions } = useChannelSelect()
const { proxyUserInfo, getProxyUserInfo } = useProxyUser()
const showSearch = ref(true)
const loading = ref(false)
const form = ref<any>({})
const addModalVisible = ref(false)
const editModalVisible = ref(false)
const qrCodeModalVisible = ref(false)
const qrCodeUrl = ref('')
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
  // await getChannelOptions()
  await getProxyUserInfo()
  form.value.channelType = proxyUserInfo.value.channelType
}

const handleUpdate = async (rowData) => {
  reset()
  editModalVisible.value = true
  form.value = { ...rowData }
  // await getChannelOptions()
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
          state: form.value.state
        })
        editModalVisible.value = false
        ElMessage({ type: 'success', message: '修改成功!' })
      } else {
        const { result } = await updateTxInfo(form.value)
        qrCodeUrl.value = result.pictureUrl || ''
        addModalVisible.value = false
        qrCodeModalVisible.value = true
        ElMessage({ type: 'success', message: '新增成功!' })
      }
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
const dateRange = ref<string[]>([])
const queryParams = reactive({
  currentPage: 1,
  pageSize: 15,
  endTime: undefined,
  startTime: undefined,
  orderNo: undefined,
  externalOrderNo: undefined,
  state: undefined,
  proxyNo: undefined
})
const txList = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getOrderList(queryParams)
  loading.value = false
  txList.value = result.list
  total.value = result.page.totalRows
}

const handleQuery = () => {
  queryParams.currentPage = 1
  queryParams.startTime = undefined
  queryParams.endTime = undefined
  if (dateRange.value && dateRange.value.length === 2) {
    // console.log(dateRange.value)
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
  if ((new Date(dateRange.value[1]).getTime() - new Date(dateRange.value[0]).getTime()) > 7 * 24 * 60 * 6000) {
    ElMessageBox.alert('* 仅支持导出时间跨度为一周的数据，当前时间范围超过一周，请重新选择', '系统提示', {
      confirmButtonText: '确认'
    })
    return
  }
  await useDownload(
    exportData,
    '代付订单',
    queryParams,
    false
  )
}

getData()
</script>

<style scoped></style>
