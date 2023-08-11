<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="500px" align-center>
    <el-form :model="form" ref="userRef" label-width="100px">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="form.userName" disabled />
      </el-form-item>
      <el-form-item v-if="form['appKey']" label="商户号" prop="proxyNo">
        <el-input v-model="form.proxyNo" disabled />
      </el-form-item>
      <el-form-item v-else label="用户ID" prop="userId">
        <el-input v-model="form.userId" disabled />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-input v-model="form.createTime" disabled />
      </el-form-item>
      <el-form-item label="当前角色" prop="roleList">
        <el-tag v-for="(role, index) of (form['roleList'] || [])" :key="index"
                type="success">
          {{role['roleName']}}
        </el-tag>
      </el-form-item>
      <template v-if="form['appKey']">
        <el-form-item label="代理商商户号">
          <el-input v-model="form['appKey']" disabled ></el-input>
        </el-form-item>
        <el-form-item label="当前余额">
          <el-input v-model="balanceInfo['balance']" disabled >
            <template #append>{{balanceInfo['currency']}}</template>
          </el-input>
        </el-form-item>
<!--        <el-form-item label="预扣金额">-->
<!--          <el-input v-model="balanceInfo['preDeductMoney']" disabled >-->
<!--            <template #append>{{balanceInfo['currency']}}</template>-->
<!--          </el-input>-->
<!--        </el-form-item>-->
        <el-form-item label="其他操作" prop="appKey">
          <div class="">
            <el-button type="primary" @click="rechargeUrlVisible = true">修改代收回调地址</el-button>
            <el-button type="primary" @click="withdrawUrlVisible = true">修改代收付调地址</el-button>
          </div>
        </el-form-item>
        <el-form-item label="" prop="appKey">
          <div class="">
            <el-button type="primary" @click="keyVisible = true">查看密钥</el-button>
          </div>
        </el-form-item>
      </template>
    </el-form>
    <el-dialog v-model="rechargeUrlVisible" width="400px"
               title="修改代收回调地址" append-to-body
               :destroy-on-close="true" align-center>
      <el-form-item label="代收回调地址" prop="rechargeUrl">
        <el-input v-model="rechargeUrl"  />
      </el-form-item>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeUrlVisible = false">取消</el-button>
          <el-button type="primary" @click="onSetRechargeUrl">确认</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="withdrawUrlVisible" width="400px"
               title="修改代付回调地址" append-to-body
               :destroy-on-close="true" align-center>
      <el-form-item label="代付回调地址" prop="withdrawUrl">
        <el-input v-model="withdrawUrl"  />
      </el-form-item>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="withdrawUrlVisible = false">取消</el-button>
          <el-button type="primary" @click="onSetWithdrawUrl">确认</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="keyVisible" width="400px"
               title="查看密钥" append-to-body
               :destroy-on-close="true" align-center>
      <el-form label-position="top">
        <el-form-item prop="appKey">
          <template #label>
            <div class="flex-1 flex justify-between items-center">
              <span>App-key</span>
              <el-button v-copy="form['appKey']"
                         type="primary" size="small"> 复制 </el-button>
            </div>
          </template>
          <el-input v-model="form['appKey']" disabled ></el-input>
        </el-form-item>
        <el-form-item prop="privateKey">
          <template #label>
            <div class="flex-1 flex justify-between items-center">
              <span>Private_Key</span>
              <el-button v-copy="form['privateKey']"
                         type="primary" size="small"> 复制 </el-button>
            </div>
          </template>
          <el-input v-model="form['privateKey']"
                    :autosize="{ minRows: 2, maxRows: 8 }"
                    type="textarea" disabled >
          </el-input>
        </el-form-item>
        <el-form-item prop="publicKey">
          <template #label>
            <div class="flex-1 flex justify-between items-center">
              <span>Public_Key</span>
              <el-button v-copy="form['publicKey']"
                         type="primary" size="small"> 复制 </el-button>
            </div>
          </template>
          <el-input v-model="form['publicKey']"
                    :autosize="{ minRows: 2, maxRows: 8 }"
                    type="textarea" disabled >
          </el-input>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getUserDetail, setProxyBackUrl, setRechargeBackUrl, getBalance } from '@/api/system/user'
import { useUserStore } from '@/stores/modules/user'
import { ElMessage } from 'element-plus'
const userStore = useUserStore()

const form = ref({})
const balanceInfo = ref({})
const getUserInfo = async () => {
  const { result } = await getUserDetail({ id: userStore.userInfo.userId })
  form.value = result
  if (form.value.appKey) {
    const res = await getBalance()
    balanceInfo.value = res.result
  }
}

const dialogVisible = ref(false)
const openDialog = () => {
  dialogVisible.value = true
  getUserInfo()
}

const rechargeUrlVisible = ref(false)
const rechargeUrl = ref('')
const onSetRechargeUrl = async () => {
  await setRechargeBackUrl({ notifyUrl: rechargeUrl.value })
  ElMessage({ type: 'success', message: '修改成功!' })
  rechargeUrlVisible.value = false
  dialogVisible.value = false
}

const withdrawUrlVisible = ref(false)
const withdrawUrl = ref('')
const onSetWithdrawUrl = async () => {
  await setProxyBackUrl({ notifyUrl: withdrawUrl.value })
  ElMessage({ type: 'success', message: '修改成功!' })
  withdrawUrlVisible.value = false
  dialogVisible.value = false
}

const keyVisible = ref(false)

defineExpose({ openDialog })
</script>
