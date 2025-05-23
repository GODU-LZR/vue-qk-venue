// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 如果需要使用 Element UI 等组件库，可在此引入
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from "../src/store/index"

Vue.use(ElementUI);

Vue.config.productionTip = false

let instance = null

function setGlobalStateToPrototype(setGlobalState) {
  // 检查是否是一个函数，以增加健壮性
  if (typeof setGlobalState === 'function') {
    Vue.prototype.$setGlobalState = setGlobalState;
    console.log('[子应用] setGlobalState 已挂载到 Vue.prototype.$setGlobalState');
  } else {
    console.warn('[子应用] props 中未找到有效的 setGlobalState 函数。子应用将无法主动更新全局状态。');
    // 提供一个空操作函数以避免组件内部调用时出错
    Vue.prototype.$setGlobalState = (state) => {
      console.warn('[子应用] $setGlobalState 调用无效: 函数未从主应用正确传递。 State:', state);
    };
  }
}

function render(props = {}) {
  const { container, setGlobalState } = props // 从 props 中解构 container 和 setGlobalState
  setGlobalStateToPrototype(setGlobalState);

  instance = new Vue({
    router,
    render: h => h(App),
    store
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  console.log('[子应用] 独立运行模式');
  // 在独立模式下，主应用不会提供 setGlobalState，我们提供一个模拟函数
  // 这个模拟函数可以用来模拟接收状态并在独立开发时测试相关逻辑
  if (!Vue.prototype.$setGlobalState) { // 避免重复挂载
    Vue.prototype.$setGlobalState = (state) => {
      console.log('[子应用-独立模式] 模拟 setGlobalState 调用:', state);
      // 可以在独立模式下根据模拟状态更新本地存储或状态管理器
      // 模拟接收并存储用户信息和 token
      if (state.userInfo) {
        console.log('[子应用-独立模式] 模拟接收到用户信息:', state.userInfo);
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
      if (state.token) {
        console.log('[子应用-独立模式] 模拟接收到 Token:', state.token ? '*** (存在)' : null);
        localStorage.setItem('auth_token', state.token);
      }
    };
  }


  render()
}

// qiankun 生命周期导出
export async function bootstrap() {
  console.log('[子应用] bootstrap');

  console.log('[events-module] bootstrap')
}

// export async function mount(props) {
//   console.log('[events-module] mount => ', props)
//   render(props)
// }


export async function mount(props) {
  console.log('[子应用] mount => 接收到 props:', props);

  // 调用 render 函数，创建并挂载 Vue 实例，并将 props 传递进去
  // render 内部会处理 setGlobalState 的挂载
  render(props);

  // --- 设置全局状态监听器 ---
  // 监听主应用传递的全局状态变化
  if (props && props.onGlobalStateChange) {
    console.log('[子应用] 检测到 onGlobalStateChange，设置监听器...');
    // onGlobalStateChange 函数接收两个参数：
    // 1. 回调函数：当全局状态变化时触发
    // 2. boolean：是否立即触发一次回调以获取初始状态 (设置为 true)
    props.onGlobalStateChange((state, prev) => {
      console.log('--- [子应用] 全局状态发生改变 (onGlobalStateChange) ---');
      console.log('Current State:', state);
      console.log('Previous State:', prev); // 可以看到状态变化前的值

      // --- 接收并处理用户信息和 JWT 指纹/Token ---
      try {
        console.log('[子应用] 正在处理接收到的全局状态...');

        // 假设用户信息在 state.userInfo 对象中
        if (state.userInfo && typeof state.userInfo === 'object') {
          console.log(' -> 接收到用户信息 (userInfo):', state.userInfo);
          // 将用户信息对象存储到 localStorage (需要 JSON.stringify)
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
          console.log('[子应用] 用户信息已存储到 localStorage (key: userInfo)');
        } else {
          console.log(' -> 全局状态中未找到有效的用户信息对象 (state.userInfo)');
          localStorage.removeItem('userInfo'); // 如果状态中没有，则清理
          console.log('[子应用] localStorage 中的 userInfo 已清理');
        }

        // 假设 JWT 指纹或 Token 在 state.token 字段中
        if (state.token) {
          console.log(' -> 接收到 Token/JWT 指纹 (token):', state.token ? '*** (存在)' : null); // 隐藏敏感信息
          // 将 Token 字符串存储到 localStorage
          localStorage.setItem('auth_token', state.token);
          console.log('[子应用] Token/JWT 指纹已存储到 localStorage (key: auth_token)');
        } else {
          console.log(' -> 全局状态中未找到有效的 Token/JWT 指纹 (state.token)');
          localStorage.removeItem('auth_token'); // 如果状态中没有，则清理
          console.log('[子应用] localStorage 中的 auth_token 已清理');
        }

        // 您可以根据需要处理其他状态字段
        // 例如：登录状态
        if (typeof state.isLoggedIn === 'boolean') {
          console.log(` -> 登录状态 (isLoggedIn): ${state.isLoggedIn}`);
          localStorage.setItem('isLoggedIn', String(state.isLoggedIn));
          console.log(`[子应用] 登录状态已存储到 localStorage (key: isLoggedIn, value: ${state.isLoggedIn})`);
        } else {
          console.log(' -> 全局状态中未找到有效的登录状态 (state.isLoggedIn)');
          localStorage.removeItem('isLoggedIn');
          console.log('[子应用] localStorage 中的 isLoggedIn 已清理');
        }


        console.log('[子应用] 全局状态处理完成。');
      } catch (error) {
        console.error('[子应用] 处理全局状态时出错:', error);
      }
      console.log('--- [子应用] 状态改变处理结束 ---');

    }, true); // <-- 这里的 true 很重要，表示在注册后立即触发一次回调，获取初始状态
  } else {
    console.warn('[子应用] 未在 props 中检测到 onGlobalStateChange 方法。子应用将无法接收全局状态变化。');
  }
}

// export async function unmount() {
//   console.log('[events-module] unmount')
//   if (instance) {
//     instance.$destroy()
//     instance.$el.innerHTML = ''
//     instance = null
//   }
// }


export async function unmount() {
  console.log('[events-module] unmount')
  if (instance) {
    instance.$destroy()
    instance.$el.innerHTML = ''
    instance = null
  }
}
