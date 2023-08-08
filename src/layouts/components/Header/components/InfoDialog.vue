<template>
  <el-dialog v-model="dialogVisible" title="个人信息" width="500px" draggable>
    <el-form :model="form" ref="userRef" label-width="120px">
      <el-form-item label="用户名称" prop="userName">
        <el-input v-model="form.userName" disabled />
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
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
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getUserDetail } from '@/api/system/user'
import { useUserStore } from '@/stores/modules/user'
const userStore = useUserStore()

const form = ref({})
const getUserInfo = async () => {
  console.log(userStore.userInfo.userId)
  const { result } = await getUserDetail({ id: userStore.userInfo.userId })
  form.value = result
}

const dialogVisible = ref(false)
const openDialog = () => {
  dialogVisible.value = true
  getUserInfo()
}

defineExpose({ openDialog })
</script>
