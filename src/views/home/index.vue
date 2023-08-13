<template>
  <div class="w-full h-full relative">
    <div v-if="userStore.userInfo.appKey"
         class="grid grid-cols-1 2xl:grid-cols-2">
      <div class="col-span-1 border-1 border-black/5 rounded-12px bg-white">
        <div class="flex justify-between items-center px-15px h-50px
                    border-b-1 border-black/5 rounded-t-12px">
          <el-form class="c-form-inline flex gap-20px" :inline="true">
            <el-form-item label="时间">
              <el-date-picker class="w-full"
                              v-model="dateRange"
                              type="datetimerange"
                              range-separator="-"
                              start-placeholder="开始时间"
                              end-placeholder="结束时间"></el-date-picker>
            </el-form-item>
            <div class="flex justify-end">
              <el-button type="primary" icon="Search" @click="getInfo">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </div>
          </el-form>
        </div>
        <div class="grid grid-cols-2 gap-20px px-15px h-40px items-center
                    border-b-1 border-black/5">
          <div class="col-span-1">代收</div>
          <div class="col-span-1">代付</div>
        </div>
        <div class="grid grid-cols-2 gap-20px px-10px items-center
                    border-b-1 border-black/5 text-14px">
          <div class="col-span-1 flex flex-col gap-10px py-20px">
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代收成功金额</span>
              <div>
                <span class="text-primary text-16px text-primary">
                {{fixedNumber(statisticsInfo['rechargeAmount']/100, 2)}}
                </span>
                <span class="px-10px">BRL</span>
              </div>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代收成功笔数</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['rechargeNum']}}
              </span>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>成功率</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['rechargeRate']||0}}%
              </span>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代收手续费</span>
              <div>
                   <span class="text-primary text-16px text-primary">
                {{fixedNumber(statisticsInfo['rechargeFee']/100, 2)}}
              </span>
                <span class="px-10px">BRL</span>
              </div>
            </div>
          </div>
          <div class="col-span-1 flex flex-col gap-10px py-20px">
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代付成功金额</span>
              <div>
                <span class="text-primary text-16px text-primary">
                {{fixedNumber(statisticsInfo['withdrawAmount']/100, 2)}}
                </span>
                <span class="px-10px">BRL</span>
              </div>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代付成功笔数</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['withdrawNum']}}
              </span>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>成功率</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['withdrawRate']||0}}%
              </span>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代付手续费</span>
              <div>
                <span class="text-primary text-16px text-primary">
                  {{fixedNumber(statisticsInfo['withdrawFee']/100, 2)}}
                </span>
                <span class="px-10px">BRL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <img v-else class="w-2/3 mx-auto" src="~@/assets/images/welcome.png" alt="">
  </div>
</template>

<script setup lang="ts" name="home">
import { reactive, ref, watch } from 'vue'
import { getStatisticsInfo } from '@/api/system/statistics'
import { useUserStore } from '@/stores/modules/user'
import { fixedNumber, formatLocalTimeToUTC } from '@/utils/tool'

const userStore = useUserStore()
const dateRange = ref([])
const queryParams = reactive({
  startTimes: undefined,
  endTimes: undefined
})
const resetQuery = () => {
  dateRange.value = []
  queryParams.startTimes = undefined
  queryParams.endTimes = undefined
  getInfo()
}

const statisticsInfo = ref({})
const getInfo = async () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTimes = formatLocalTimeToUTC(dateRange.value[0]) as any
    queryParams.endTimes = formatLocalTimeToUTC(dateRange.value[1]) as any
  }
  const { result } = await getStatisticsInfo(queryParams)
  statisticsInfo.value = result || {}
}

watch([() => userStore.userInfo.appKey], () => {
  console.log(userStore.userInfo.appKey)
  if (userStore.userInfo.appKey) getInfo()
}, { immediate: true })
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
