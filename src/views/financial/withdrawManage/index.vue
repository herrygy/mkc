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
        <el-button v-auth="['withdrawApply_withdrawCash']" type="primary" icon="Plus"
                   @click="handleAdd">提现申请</el-button>
      </div>
      <el-table v-loading="loading" :data="txList">
        <el-table-column label="App_key" prop="appKey" width="120" :show-overflow-tooltip="true"/>
        <el-table-column label="订单号" prop="orderNo" width="120" />
        <el-table-column label="处理状态" prop="dealState" width="120" >
          <template #default="scope">
            <div>{{scope.row['dealState']===0?'待处理':'已处理'}}</div>
          </template>
        </el-table-column>
        <el-table-column label="金额" prop="amount" width="120" />
        <el-table-column label="渠道类型" prop="channelType" width="120" />
        <el-table-column label="银行手续费" prop="bankFee" width="120" />
        <el-table-column label="平台手续费" prop="fee" width="120" />
        <el-table-column label="收款人" prop="name" width="200" :show-overflow-tooltip="true"/>
        <el-table-column label="收款银行帐号" prop="accountNumber" width="200" :show-overflow-tooltip="true"/>
        <el-table-column label="Branch Code" prop="branchCode" width="120" :show-overflow-tooltip="true"/>
        <el-table-column label="Bank code" prop="bankCode" width="120" :show-overflow-tooltip="true"/>
        <el-table-column label="TaxId" prop="taxId" width="200" :show-overflow-tooltip="true"/>
        <el-table-column label="描述信息" prop="description" width="120" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="200">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding" fixed="right" width="120">
          <template #default="scope">
            <el-tooltip content="审批" placement="top" :show-after="500">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-auth="['withdrawApply_approveWithdraw']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <Pagination v-show="total > 0" :total="total"
                  v-model:page="queryParams.currentPage"
                  v-model:limit="queryParams.pageSize"
                  @pagination="getList" />
    </div>

    <!-- 新增提现申请 -->
    <el-drawer title="新增提现申请" v-model="addModalVisible" :destroy-on-close="true" size="450px">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="120px">
        <el-form-item label="提现类型" prop="amount">
          <el-radio-group v-model="form['type']" class="ml-4" @change="typeChange">
            <el-radio :label="0">银行</el-radio>
            <el-radio :label="1">Pix</el-radio>
          </el-radio-group>
        </el-form-item>
        <div class="ml-120px">
          <div class="text-12px text-colorF5 leading-18px">
            *当前最小提现额度：{{proxyUserInfo['perMinWithdraw']}} <br>
            *当前最大提现额度：{{proxyUserInfo['perMaxWithdraw']}}
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
        <el-button @click="approveModalVisible=false">取 消</el-button>
      </div>
    </el-drawer>

    <!-- 审批 -->
    <el-dialog title="审批" width="400px"
               v-model="approveModalVisible" :destroy-on-close="true">
      <el-form :model="form" :rules="rules" ref="userRef" label-width="100px">
        <el-form-item label="提现类型" prop="amount">
          <el-radio-group v-model="form['type']" class="ml-4" disabled>
            <el-radio :label="0">银行</el-radio>
            <el-radio :label="1">Pix</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="form['amount']" class="flex-1" disabled/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form['description']" type="textarea" maxlength="120" disabled/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="onApprove(2)" type="danger">驳回</el-button>
          <el-button type="primary" @click="onApprove(1)">通过</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { getWithdrawList, addNew, approve } from '@/api/financial/withdraw'
import { parseTime } from '@/utils/tool.ts'
import Pagination from '@/components/Pagination/index.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useChannelSelect } from '@/composables/useChannelSelect'
import { useProxyUser } from '@/composables/useProxyUser'
import { useUserStore } from '@/stores/modules/user'

const { proxyUserInfo, getProxyUserInfo } = useProxyUser()
const { channelOptions, getChannelOptions } = useChannelSelect()
const showSearch = ref(true)
const loading = ref(false)
const title = ref('')
const form = ref<any>({})
const addModalVisible = ref(false)
const approveModalVisible = ref(false)
const userRef = ref()
const userStore = useUserStore()

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

const handleAdd = async () => {
  reset()
  addModalVisible.value = true
  form.value.type = 0
  await getProxyUserInfo()
  form.value.channelType = proxyUserInfo.value.channelType
  // form.value = {
  //   accountNumber: '876543-2.',
  //   amount: 200,
  //   appKey: 'wex812pfqbhjq',
  //   bankCode: '1234-5',
  //   branchCode: '876',
  //   channelType: 'StarkBank',
  //   name: 'Joana da Silva',
  //   taxId: '012.345.678-90',
  //   type: 0,
  //   userId: 39
  // }
}

const typeChange = (value) => {
  reset()
  form.value.type = value
  form.value.channelType = proxyUserInfo.value.channelType
}

const handleUpdate = async (rowData) => {
  reset()
  approveModalVisible.value = true
  form.value = { ...rowData }
}

const reset = () => {
  form.value = {}
  if (userRef.value) userRef.value.resetFields()
}

const submitForm = async () => {
  userRef.value.validate(async (valid) => {
    if (valid) {
      await addNew({ ...form.value, userId: userStore.userInfo.userId, appKey: userStore.userInfo.appKey })
      ElMessage({ type: 'success', message: '新增成功!' })
      addModalVisible.value = false
      await getList()
    }
  })
}

const onApprove = async (state) => {
  const { result } = await approve({
    dealState: state,
    id: form.value.id
  })
  ElMessage({ type: 'success', message: '操作成功!' })
  await getList()
}

const handleDelete = (rowData:any = {}) => {
  ElMessageBox.confirm(`是否删除交易ID为 ${rowData.id} 的数据?`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // await deleteTx({ id: rowData.id })
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
