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
    // 确保高德地图 API 已加载
    this.loadAmapScript().then(() => {
      this.initMap(); // 在高德地图 API 加载完成后初始化地图
    }).catch((error) => {
      console.error('高德地图 API 加载失败', error);
    });
  },
  methods: {
    // 加载高德地图 API
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
        script.onerror = reject;

        window.initAMap = () => {
          resolve(window.AMap); // 加载完成后执行
        };

        document.head.appendChild(script); // 动态插入 script
      });
    },

    // 初始化地图
    initMap() {
      const mapContainer = document.getElementById('map-container');
      if (mapContainer && window.AMap) {
        this.map = new AMap.Map(mapContainer, {
          zoom: 15, // 初始化地图层级
          center: [110.300695, 21.151325], // 初始化地图中心点
        });

        // 加载 Geolocation 插件
        AMap.plugin("AMap.Geolocation", () => {
          this.geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
          });

          this.getUserLocation();
        });
      } else {
        console.error("高德地图 API 或容器未加载");
      }
    },

    // 获取用户当前位置
    getUserLocation() {
      this.geolocation.getCurrentPosition((status, result) => {
        if (status === "complete") {
          const { position } = result;
          this.addMarker(position);
          this.map.setCenter(position);
          this.startWatchingPosition();
        } else {
          console.error("定位失败：", result);
        }
      });
    },

    // 开始实时定位
    startWatchingPosition() {
      this.watchId = this.geolocation.watchPosition((status, result) => {
        if (status === "complete") {
          const { position } = result;
          this.updateMarker(position);
          this.map.setCenter(position);
        } else {
          console.error("实时定位失败：", result);
        }
      });
    },

    // 添加标记
    addMarker(position) {
      if (this.marker) {
        this.map.remove(this.marker);
      }
      this.marker = new AMap.Marker({
        position: position,
        map: this.map,
      });
    },

    // 更新标记位置
    updateMarker(position) {
      if (this.marker) {
        this.marker.setPosition(position);
      } else {
        this.addMarker(position);
      }
    },

    stopWatchingPosition() {
      if (this.watchId) {
        this.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
    },
  },
  beforeDestroy() {
    this.stopWatchingPosition();
    if (this.marker) {
      this.map.remove(this.marker);
    }
    if (this.map) {
      this.map.destroy();
    }
  },
};
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 550px;
  border: 1px solid #ccc;
}
</style>
