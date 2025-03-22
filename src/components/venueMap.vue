<template>
  <div id="map-container"></div>
</template>

<script>
export default {
  name: "venueMap",
  data() {
    return {
      map: null, // 地图实例
      geolocation: null, // 定位实例
      marker: null, // 标记实例
      watchId: null, // 实时定位的监听 ID
    };
  },
  mounted() {
    this.initMap(); // 初始化地图
  },
  methods: {
    // 初始化地图
    initMap() {
      if (window.AMap) {
        // 创建地图实例
        this.map = new AMap.Map("map-container", {
          zoom: 15, // 初始化地图层级
          center: [110.300695, 21.151325], // 初始化地图中心点（北京天安门）
        });

        // 加载 Geolocation 插件
        AMap.plugin("AMap.Geolocation", () => {
          // 插件加载完成后，初始化 Geolocation
          this.geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位
            timeout: 10000, // 定位超时时间（毫秒）
          });

          // 调用定位方法
          this.getUserLocation();
        });
      } else {
        console.error("高德地图 API 未加载");
      }
    },

    // 获取用户当前位置
    getUserLocation() {
      this.geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          // 定位成功
          const { position } = result;
          this.addMarker(position); // 添加标记
          this.map.setCenter(position); // 将地图中心点设置为当前位置

          // 开始实时定位
          this.startWatchingPosition();
        } else {
          // 定位失败
          console.error("定位失败：", result);
        }
      });
    },

    // 开始实时定位
    startWatchingPosition() {
      this.watchId = this.geolocation.watchPosition((status, result) => {
        if (status === "complete") {
          // 定位成功
          const { position } = result;
          this.updateMarker(position); // 更新标记位置
          this.map.setCenter(position); // 将地图中心点设置为当前位置
        } else {
          // 定位失败
          console.error("实时定位失败：", result);
        }
      });
    },

    // 添加标记
    addMarker(position) {
      if (this.marker) {
        this.map.remove(this.marker); // 如果已有标记，先移除
      }
      // 创建新的标记
      this.marker = new AMap.Marker({
        position: position, // 标记的位置
        map: this.map, // 标记所属的地图实例
      });
    },

    // 更新标记位置
    updateMarker(position) {
      if (this.marker) {
        this.marker.setPosition(position); // 更新标记位置
      } else {
        this.addMarker(position); // 如果标记不存在，创建新标记
      }
    },

    // 停止实时定位
    stopWatchingPosition() {
      if (this.watchId) {
        this.geolocation.clearWatch(this.watchId); // 停止实时定位
        this.watchId = null;
      }
    },
  },
  beforeDestroy() {
    // 组件销毁时停止实时定位并清理资源
    this.stopWatchingPosition(); // 停止实时定位
    if (this.marker) {
      this.map.remove(this.marker); // 移除标记
    }
    if (this.map) {
      this.map.destroy(); // 销毁地图实例
    }
  },
};
</script>

<style scoped>
#map-container {
  width: 99%; /* 宽度自适应父容器 */
  height: 550px; /* 设置固定高度 */
  border: 1px solid #ccc; /* 可选：添加边框 */
}
</style>