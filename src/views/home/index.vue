<template>
  <div class="w-full h-full relative">
    <div class="grid grid-cols-1 2xl:grid-cols-2">
      <div class="col-span-1 border-1 border-black/5 rounded-12px bg-white">
        <div class="flex justify-between items-center px-15px h-50px
                    border-b-1 border-black/5 rounded-t-12px">
          <el-form class="c-form-inline flex gap-20px" :inline="true">
            <el-form-item label="日期">
              <el-date-picker class="w-full"
                              v-model="dateRange"
                              value-format="YYYY-MM-DD"
                              type="daterange"
                              range-separator="-"
                              start-placeholder="开始日期"
                              end-placeholder="结束日期"></el-date-picker>
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
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['rechargeAmount']}}
              </span>
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
                {{statisticsInfo['rechargeRate']}}%
              </span>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代收手续费</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['rechargeFee']}}
              </span>
            </div>
          </div>
          <div class="col-span-1 flex flex-col gap-10px py-20px">
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代付成功金额</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['withdrawAmount']}}
              </span>
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
                {{statisticsInfo['withdrawRate']}}%
              </span>
            </div>
            <div class="bg-black/5 h-36px px-10px rounded-6px
                        flex items-center justify-between ">
              <span>代付手续费</span>
              <span class="text-primary text-16px text-primary">
                {{statisticsInfo['withdrawFee']}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="home">
import { reactive, ref } from 'vue'
import { getStatisticsInfo } from '@/api/system/statistics'
const dateRange = ref([])
const queryParams = reactive({
  startTime: undefined,
  endTime: undefined
})
const resetQuery = () => {
  dateRange.value = []
  queryParams.startTime = undefined
  queryParams.endTime = undefined
  getInfo()
}

const statisticsInfo = ref({})
const getInfo = async () => {
  if (dateRange.value) [queryParams.startTime, queryParams.endTime] = dateRange.value
  const { result } = await getStatisticsInfo(queryParams)
  statisticsInfo.value = result || {}
}
getInfo()
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>
