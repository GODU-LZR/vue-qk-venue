<template>
  <div> <!-- 添加一个父级 div 来解决模板根元素问题 -->
    <div id="map-container"></div>
    <!-- 添加一个元素来显示状态或错误信息，方便调试 -->
    <div v-if="locationStatus" class="location-status">{{ locationStatus }}</div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: "venueMap",
  computed: {
    // 第二步：使用辅助函数，将需要的数据的键名写入
    // nearPosition 将从 Vuex store 的 state 中映射到组件的 computed 属性
    ...mapState(['nearPosition'])
  },
  data() {
    return {
      map: null, // 地图实例
      geolocation: null, // 定位实例
      userMarker: null, // 用户位置标记实例
      watchId: null, // 实时定位的监听 ID

      // venueMarkers 数组不再需要作为组件的 data，数据来自 Vuex 的 nearPosition
      // venueMarkers: ['110.300695, 21.151325', '111.300695, 22.151325'],

      venueMarkerInstances: [], // 用于存储场馆标记实例的数组

      locationStatus: '正在加载地图...', // 用于显示状态或错误信息
    };
  },
  watch: {
    // 监听 Vuex 中 nearPosition 状态的变化
    // 当 nearPosition 数组的内容发生变化时，这个 handler 会执行
    nearPosition: {
      deep: true, // 如果 nearPosition 是一个数组或对象，需要 deep: true 来监听内部元素的变化
      handler(newVal, oldVal) {
        console.log('Vuex nearPosition 状态变化，触发标记刷新:', newVal);
        // 当 nearPosition 变化时，调用添加标记的方法，该方法会先清除旧标记
        this.addVenueMarkers();
      }
    }
  },
  mounted() {
    // 确保高德地图 API 已加载
    this.loadAmapScript().then(() => {
      this.initMap(); // 在高德地图 API 加载完成后初始化地图
    }).catch((error) => {
      console.error('高德地图 API 加载失败', error);
      this.locationStatus = '高德地图 API 加载失败'; // 更新状态
    });
  },
  methods: {
    ...mapMutations(['updateLocation']),

    // 加载高德地图 API (添加了错误处理)
    loadAmapScript() {
      return new Promise((resolve, reject) => {
        if (window.AMap) {
          resolve(window.AMap); // 如果已经加载，则直接返回
          return;
        }
        const script = document.createElement('script');
        script.type = 'text/javascript';
        // 添加callback参数
        script.src = `https://webapi.amap.com/maps?v=2.0&key=2493f23a77c36788f2df48379a1c6f91&callback=initAMap`;
        script.async = true;
        // 添加 onerror 处理
        script.onerror = (e) => {
          this.locationStatus = '高德地图脚本加载失败';
          reject(e);
        };

        window.initAMap = () => {
          resolve(window.AMap); // 加载完成后执行
        };

        document.head.appendChild(script); // 动态插入 script
      });
    },

    // 初始化地图 (并在加载完成后添加场馆标记)
    initMap() {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer && window.AMap) {
        this.locationStatus = '地图加载成功，正在初始化...'; // 更新状态
        this.map = new AMap.Map(mapContainer, {
          zoom: 12, // 初始化地图层级可以稍微小一点，方便查看多个标记
          // 初始中心点可以根据你的需求设定，或者等待标记加载后 setFitView
          center: [110.300695, 21.151325],
          viewMode: '2D' // 可以先用 2D 模式
        });

        // *** 地图初始化完成后，添加场馆标记 (首次加载) ***
        this.map.on('complete', () => {
          console.log('地图加载完成');
          // 如果定位尚未成功，显示地图加载完成
          if (this.locationStatus.startsWith('正在加载地图') || this.locationStatus === '地图加载成功，正在初始化...') {
            this.locationStatus = '地图加载完成';
          }
          // 地图加载完成后，根据当前的 nearPosition 数据添加标记
          this.addVenueMarkers();
        });

        // 加载 Geolocation 插件 (这部分是获取用户位置，与场馆标记独立)
        AMap.plugin("AMap.Geolocation", () => {
          this.geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            // 插件加载失败时的错误回调
            error: (e) => {
              console.error("Geolocation plugin error:", e);
              this.locationStatus = '定位插件加载失败';
            }
          });

          // 确保 geolocation 插件加载成功后再尝试获取位置
          if (this.geolocation) {
            // 如果需要获取用户位置，调用此方法
            // this.getUserLocation();
          } else {
            console.error("AMap.Geolocation plugin failed to load.");
            this.locationStatus = '定位插件加载失败';
          }
        });


      } else {
        console.error("高德地图 API 或容器未加载");
        this.locationStatus = '地图初始化失败'; // 更新状态
      }
    },

    // 这个方法负责根据当前的 this.nearPosition 数据添加场馆标记
    // 它会先清除旧标记，然后绘制新标记
    addVenueMarkers() {
      if (!this.map) {
        console.error("地图实例未初始化，无法添加场馆标记。");
        this.locationStatus = '地图未准备好，无法添加标记。';
        return;
      }

      // 清除之前可能存在的场馆标记
      if (this.venueMarkerInstances.length > 0) {
        console.log(`清除 ${this.venueMarkerInstances.length} 个旧场馆标记`);
        this.map.remove(this.venueMarkerInstances);
        this.venueMarkerInstances = []; // 清空数组
      } else {
        console.log("没有旧场馆标记需要清除");
      }

      const validPositions = []; // 用于存储有效的经纬度对象，以便 setFitView

      // 使用 Vuex 中的 nearPosition 数据
      if (this.nearPosition && this.nearPosition.length > 0) {
        this.locationStatus = `正在添加 ${this.nearPosition.length} 个场馆标记...`;
        this.nearPosition.forEach(locationStr => {
          const parts = locationStr.split(',');
          if (parts.length === 2) {
            try {
              // 注意：高德地图的 position 是 [经度, 纬度]
              const longitude = parseFloat(parts[0].trim()); // 提取经度
              const latitude = parseFloat(parts[1].trim()); // 提取纬度

              if (!isNaN(longitude) && !isNaN(latitude)) {
                const position = new AMap.LngLat(longitude, latitude); // 创建 AMap.LngLat 对象

                const marker = new AMap.Marker({
                  position: position, // 使用 AMap.LngLat 对象
                  map: this.map,
                  // 可以为场馆标记设置一个特定的图标
                  // icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png', // 示例：蓝色标记
                  // offset: new AMap.Pixel(-10, -34), // 调整锚点
                  // title: `场馆 @ ${locationStr}` // 鼠标悬停时的标题
                });

                this.venueMarkerInstances.push(marker); // 将标记实例存储起来
                validPositions.push(position); // 将有效位置添加到数组
                // console.log(`已添加场馆标记: ${locationStr}`); // 避免过多日志

              } else {
                console.warn(`Skipping invalid number format in venue marker string: ${locationStr}`);
              }
            } catch (e) {
              console.error(`Error parsing venue marker string: ${locationStr}`, e);
            }
          } else {
            console.warn(`Skipping invalid venue marker string format: ${locationStr}`);
          }
        });

        // 如果成功添加了标记，调整地图视野以包含所有标记
        if (this.venueMarkerInstances.length > 0) {
          // setFitView 可以接受 AMap.LngLat 数组或 Marker 实例数组
          this.map.setFitView(this.venueMarkerInstances, false, [50, 50, 50, 50]); // 调整视野并设置边距
          this.locationStatus = `已加载 ${this.venueMarkerInstances.length} 个场馆标记。`;
        } else {
          this.locationStatus = '未找到有效的场馆标记数据。';
        }
      } else {
        this.locationStatus = '没有场馆标记数据可加载。';
        console.log("nearPosition 数组为空或 null，没有标记要添加。");
      }
    },


    // ======================================================================
    // 以下是与场馆标记刷新独立的用户定位相关方法，根据需要保留或移除
    // ======================================================================

    // 获取用户当前位置 (这部分与场馆标记刷新独立)
    getUserLocation() {
      if (!this.geolocation) {
        this.locationStatus = '定位服务未加载';
        console.error('Geolocation service not loaded.');
        return;
      }
      this.locationStatus = '正在获取当前位置...'; // 更新状态
      this.geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          const { position } = result;
          this.addUserMarker(position); // 使用新的方法名
          // this.map.setCenter(position); // 不再强制设置中心到用户位置，保留中心点标记
          // this.startWatchingPosition(); // 如果需要实时跟踪，保留此行

          // 定位成功时更新状态
          this.locationStatus = `当前位置：${position.getLat()}, ${position.getLng()}`;
        } else {
          console.error("定位失败：", result);
          let errorMessage = '定位失败';
          if (result && result.message) {
            errorMessage += `: ${result.message}`;
          } else if (result && result.info) {
            errorMessage += `: ${result.info}`;
          }
          this.locationStatus = errorMessage + '。请检查定位权限或网络。'; // 更新状态，提供提示
        }
      });
    },

    // 开始实时定位 (这部分与场馆标记刷新独立)
    startWatchingPosition() {
      if (!this.geolocation) {
        console.error('Geolocation service not loaded for watching.');
        return;
      }
      this.watchId = this.geolocation.watchPosition((status, result) => {
        if (status === "complete") {
          const { position } = result;
          this.updateUserMarker(position); // 使用新的方法名
          this.map.setCenter(position); // 实时跟踪用户位置
        } else {
          console.error("实时定位失败：", result);
          let errorMessage = '实时定位失败';
          if (result && result.message) {
            errorMessage += `: ${result.message}`;
          } else if (result && result.info) {
            errorMessage += `: ${result.info}`;
          }
          // 只在实时定位失败时更新状态，避免覆盖初始定位成功信息
          if (!this.locationStatus.includes('当前位置：')) {
            this.locationStatus = errorMessage + '。';
          }
        }
      });
    },

    // 添加用户标记 (与场馆标记刷新独立)
    addUserMarker(position) {
      if (this.userMarker) {
        this.map.remove(this.userMarker);
      }
      this.userMarker = new AMap.Marker({
        position: position,
        map: this.map,
        // 可以给用户标记设置一个特定的图标
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png', // 示例：蓝色起点标记
        offset: new AMap.Pixel(-12, -36), // 调整锚点
      });
      // 添加用户标记后，调整视野以包含所有场馆标记和用户标记
      const pointsToFit = [...this.venueMarkerInstances]; // 复制场馆标记实例数组
      if (this.userMarker) {
        pointsToFit.push(this.userMarker); // 添加用户标记实例
      }
      if (pointsToFit.length > 0) {
        this.map.setFitView(pointsToFit, false, [50, 50, 50, 50]); // 调整视野并设置边距
      }
    },

    // 更新用户标记位置 (与场馆标记刷新独立)
    updateUserMarker(position) {
      if (this.userMarker) {
        this.userMarker.setPosition(position);
        this.map.setCenter(position); // 实时更新时，保持中心在用户位置
      } else {
        this.addUserMarker(position);
      }
    },

    stopWatchingPosition() {
      if (this.watchId) {
        this.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    },

    beforeDestroy() {
      this.stopWatchingPosition();
      // 清除用户标记
      if (this.userMarker) {
        this.map.remove(this.userMarker);
        this.userMarker = null; // 清空引用
      }
      // 清除所有场馆标记
      if (this.venueMarkerInstances.length > 0) {
        this.map.remove(this.venueMarkerInstances);
        this.venueMarkerInstances = []; // 清空数组
      }
      // 清空地图引用
      if (this.map) {
        this.map.destroy();
        this.map = null; // 清空引用
      }
      // 清空状态信息
      this.locationStatus = null;
    },
  }, // <-- methods 对象结束
  // ... (其他选项，如 computed, watch 等)
};
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 550px;
  border: 1px solid #ccc;
}
/* 用于状态显示 */
.location-status {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9em;
  color: #333;
  z-index: 1000;
}
</style>
