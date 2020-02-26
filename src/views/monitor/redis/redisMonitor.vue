<template>
  <div>
    <el-row>
      <el-col :span="12">
        <apexchart
          ref="memoryInfo"
          type="area"
          height="350"
          :options="memory.chartOptions"
          :series="memory.series"
        />
      </el-col>
      <el-col :span="12">
        <apexchart
          ref="keySize"
          type="area"
          height="350"
          :options="key.chartOptions"
          :series="key.series"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-divider content-position="left">Redis详细信息</el-divider>
      <el-table v-loading="loading" :data="redisInfoList" :show-header="false">
        <el-table-column label="Key" align="left" :show-overflow-tooltip="true"  prop="key"/>
        <el-table-column label="Description" align="left" prop="description"/>
        <el-table-column label="Value" align="left" prop="value"/>
      </el-table>
    </el-row>
  </div>
</template>

<script>
import { getRedisKeySize, getRedisMemory, getRedisInfo } from "@/api/monitor/redis";
export default {
  name: "RedisMonitor",
  data() {
    return {
      loading: false,
      memory: {
        series: [],
        chartOptions: {
          chart: {
            animations: {
              enabled: true,
              easing: "linear",
              dynamicAnimation: {
                speed: 5000
              }
            },
            toolbar: {
              show: false
            },
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: "smooth"
          },
          title: {
            text: "Redis内存实时占用情况（KB）",
            align: "left"
          },
          markers: {
            size: 0
          },
          xaxis: {},
          yaxis: {},
          legend: {
            show: false
          }
        },
        data: [],
        xdata: []
      },
      key: {
        series: [],
        chartOptions: {
          chart: {
            animations: {
              enabled: true,
              easing: "linear",
              dynamicAnimation: {
                speed: 5000
              }
            },
            toolbar: {
              show: false
            },
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          colors: ["#f5564e"],
          stroke: {
            curve: "smooth"
          },
          title: {
            text: "Redis key实时数量（个）",
            align: "left"
          },
          markers: {
            size: 0
          },
          xaxis: {},
          yaxis: {},
          legend: {
            show: false
          }
        },
        data: [],
        xdata: []
      },
      redisInfoList: [],
      timer: null
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.getData();
      this.getInfo();
    },
    // 统计
    getData() {
      let minMemory = 1e10;
      let minSize = 1e10;
      let maxMemory = -1e10;
      let maxSize = -1e10;
      this.timer = setInterval(() => {
        // 内存
        getRedisMemory().then(res => {
          let currentMemory = Number(res.data.memory) / 1024;
          // 更新最大最小值
          if (currentMemory < minMemory) {
            minMemory = currentMemory;
          }
          if (currentMemory > maxMemory) {
            maxMemory = currentMemory;
          }

          this.memory.data.push(Number(currentMemory.toFixed(2)));
          this.memory.xdata.push(res.data.time);
          // 5个点
          if (this.memory.data.length >= 6) {
            this.memory.data.shift();
            this.memory.xdata.shift();
          }
          // 更新点信息
          this.$refs.memoryInfo.updateSeries([
            {
              name: "内存(KB)",
              data: this.memory.data
            }
          ]);

          // 更新最大最小值
          this.$refs.memoryInfo.updateOptions(
            {
              xaxis: {
                categories: this.memory.xdata
              },
              yaxis: {
                min: minMemory - 2,
                max: maxMemory + 2
              }
            },
            true,
            true
          );
        });
        // 键值
        getRedisKeySize().then(res => {
          let currentSize = res.data.keySize;
          // 更新最大最小值
          if (currentSize < minSize) {
            minSize = currentSize;
          }
          if (currentSize > maxSize) {
            maxSize = currentSize;
          }

          this.key.data.push(currentSize);
          this.key.xdata.push(res.data.time);
          // 5个点
          if (this.key.data.length >= 6) {
            this.key.data.shift();
            this.key.xdata.shift();
          }
          // 更新点信息
          this.$refs.keySize.updateSeries([
            {
              name: "key数量",
              data: this.key.data
            }
          ]);
          // 更新最大最小值
          this.$refs.keySize.updateOptions(
            {
              xaxis: {
                categories: this.key.xdata
              },
              // 避免最大最小值一致
              yaxis: {
                min: minSize - 2,
                max: maxSize + 2
              }
            },
            true,
            true
          );
        });
      }, 5000);
    },
    getInfo() {
      getRedisInfo().then(res => {
        let data = [];
        res.data.forEach(e => {
          if (e.description) {
            data.push(e);
          }
        });
        this.redisInfoList = data;
      });
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
};
</script>
<style lang="less">
</style>
