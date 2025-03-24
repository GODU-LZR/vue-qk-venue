import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 如果需要使用 Element UI 等组件库，可在此引入
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI);

Vue.config.productionTip = false

let instance = null

function render(props = {}) {
  const { container } = props
  instance = new Vue({
    router,
    render: h => h(App)
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// qiankun 生命周期导出
export async function bootstrap() {
  console.log('[venue-module] bootstrap');
}

export async function mount(props) {
  console.log('[venue-module] mount => ', props);

  // 加载高德地图脚本
  try {
    await loadAmapScript();
    render(props); // 确保脚本加载完成后再渲染
  } catch (error) {
    console.error('[venue-module] Failed to load AMap script', error);
  }
}

export async function unmount() {
  console.log('[venue-module] unmount');
  if (instance) {
    instance.$destroy();
    instance.$el.innerHTML = '';
    instance = null;
  }
}

// 加载高德地图 API
function loadAmapScript() {
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
}
