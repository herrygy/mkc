<template>
  <el-config-provider :locale="locale" :size="assemblySize" :button="buttonConfig">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getBrowserLang } from '@/utils'
import { useTheme } from '@/hooks/useTheme'
import { ElConfigProvider } from 'element-plus'
import { LanguageType } from './stores/interface'
import { useGlobalStore } from '@/stores/modules/global'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const globalStore = useGlobalStore()

// init theme
const { initTheme } = useTheme()
initTheme()

// init language
const i18n = useI18n()
onMounted(() => {
  const language = globalStore.language ?? getBrowserLang()
  i18n.locale.value = 'zh'
  globalStore.setGlobalState(['language', language as LanguageType])
})

// element language
const locale = computed(() => {
  if (globalStore.language === 'zh') return zhCn
  if (globalStore.language === 'en') return en
  return getBrowserLang() === 'zh' ? zhCn : en
})

// element assemblySize
const assemblySize = computed(() => globalStore.assemblySize)

// element button config
const buttonConfig = reactive({ autoInsertSpace: false })

// 新增用户： 即新增管理员
// 新增代理： 新增代理商 可新增下级代理
// 充值订单：（代收订单）; 生成收款二维码
// 提现记录：（代付订单）
// 财务管理->提现申请： 银行提现、pix提现、usdt提现
// 商户余额数据（暂无）
</script>
