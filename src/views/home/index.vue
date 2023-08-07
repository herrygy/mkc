<template>
  <div class="w-full h-full relative">
    <div class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-0">
      <img class="w-2/3 mx-auto" src="@/assets/images/welcome.png" alt="welcome" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:gird-cols-4 xl:grid-cols-5 gap-15px z-1 relative">
      <div class="col-span-1 bg-white rounded-4px p-20px flex flex-col justify-center items-center gap-15px">
        <div class="text-40px font-700">{{statisticsInfo['amount']}}</div>
        <div>交易金额</div>
      </div>
      <div class="col-span-1 bg-white rounded-4px p-20px flex flex-col justify-center items-center gap-15px">
        <div class="text-40px font-700">{{statisticsInfo['num']}}</div>
        <div>交易笔数</div>
      </div>
      <div class="col-span-1 bg-white rounded-4px p-20px flex flex-col justify-center items-center gap-15px">
        <div class="text-40px font-700">{{statisticsInfo['balance']}}</div>
        <div>实时余额</div>
      </div>
      <div class="col-span-1 bg-white rounded-4px p-20px flex flex-col justify-center items-center gap-15px">
        <div class="text-40px font-700">{{statisticsInfo['settled']}}</div>
        <div>待结算</div>
      </div>
      <div class="col-span-1 bg-white rounded-4px p-20px flex flex-col justify-center items-center gap-15px">
        <div class="text-40px font-700">{{statisticsInfo['commission']}}</div>
        <div>佣金</div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts" name="home">
import { ref } from 'vue'
import { getStatisticsInfo } from '@/api/system/statistics'

const statisticsInfo = ref({})
const getInfo = async () => {
  const { result } = await getStatisticsInfo()
  statisticsInfo.value = result || {}
}
getInfo()
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
