<template>
   <div class="app-container">
      <h4 class="form-header h4">基本信息</h4>
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户ID" prop="nickName">
          <el-input :value="form.userId" disabled />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input :value="form.userName" disabled />
        </el-form-item>
      </el-form>

      <h4 class="form-header h4">角色信息</h4>
     <el-table v-loading="loading" :row-key="getRowKey"
               class="bg-primary"
               @row-click="clickRow" ref="allRoleRef"
               @selection-change="handleSelectionChange"
               :data="roleList">
       <el-table-column type="selection" width="50" align="center" />
       <el-table-column label="角色ID" prop="roleId" width="100"/>
       <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" />
     </el-table>
     <div class="my-20px text-center">
       <el-button class="min-w-120px" type="primary" @click="submitForm()">提交</el-button>
     </div>
   </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { getAllRole } from '@/api/system/role'
import { distributeRole } from '@/api/system/user'
import { ElMessage } from 'element-plus'

const props = defineProps(['form', 'selectedRoleList'])
const emit = defineEmits(['update'])
const loading = ref(true)
const allRoleRef = ref<any>([])
const roleList = ref([])
const roleIds = ref([])
const getList = async () => {
  loading.value = true
  const { result } = await getAllRole()
  loading.value = false
  roleList.value = result
  nextTick(() => {
    roleList.value.forEach(row => {
      if (props.form.roleIds.indexOf(row.roleId) >= 0) allRoleRef.value.toggleRowSelection(row)
    })
  })
}

const getRowKey = (rowData) => {
  return rowData.roleId
}
const clickRow = (rowData) => {
  allRoleRef.value.toggleRowSelection(rowData)
}

const handleSelectionChange = (selection) => {
  roleIds.value = selection.map(item => item.roleId)
}
const submitForm = async () => {
  await distributeRole({
    userId: props.form.userId,
    roleIds: roleIds.value
  })
  ElMessage({ type: 'success', message: '操作成功!' })
  emit('update')
}
getList()
</script>
