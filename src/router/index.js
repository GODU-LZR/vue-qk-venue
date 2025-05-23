// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'
import venue from '@/views/venue/venue'
import order from '@/views/order/order'
import VenueMap from '@/views/VenueMap'

import admin_venue from '@/views/admin/venue/venue'
import audit from '@/views/admin/audit/audit'


// --- 导入认证检查函数 (如果需要在独立运行时检查 token 有效期) ---
// 假设您的子应用中也有一个类似的方法来检查 localStorage 中的 token
const hasValidTokenInStandalone = () => {
  // 简单检查：仅判断 localStorage 中是否存在 auth_token 或其他您存储 token 的 key
  // 请根据您的实际存储方式修改 'auth_token'
  const token = localStorage.getItem('auth_token'); // 或者 localStorage.getItem('token')
  // 这里可以添加更复杂的逻辑，比如解码 token 检查过期时间
  // import { isTokenValid } from '@/utils/auth'; // 假设您有这样的工具函数
  // return isTokenValid();
  return !!token; // 简单判断 token 是否存在
};

// --- 读取基座 URL 配置 (用于独立运行时重定向) ---
// 确保您的子应用构建配置中有 VUE_APP_MAIN_APP_BASE_URL 环境变量
const mainAppBaseUrl = process.env.VUE_APP_MAIN_APP_BASE_URL || 'http://localhost:3000'; // 默认值，请根据实际情况修改


Vue.use(Router)

const routes = [
  { path: '/', redirect: '/venue'},
  { path: '/venue', name: 'venue', component: venue},
  { path: '/order', name: 'order', component: order},
  { path: '/VenueMap', name: 'VenueMap', component: VenueMap},
  { path: '/admin', name: 'admin', redirect: '/admin/venue'},
  { path: '/admin/venue', name: 'audit', component: admin_venue},
  { path: '/admin/audit', name: 'admin_venue', component: audit},
]

const router = new Router({
  mode: 'history',
  // 若在 qiankun 环境下，设置 base 为 /events
  base: window.__POWERED_BY_QIANKUN__ ? '/venue' : '/',
  routes
})

// --- 添加全局前置路由守卫 ---
router.beforeEach((to, from, next) => {
  // 检查目标路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 判断是否在 Qiankun 环境下运行
  if (window.__POWERED_BY_QIANKUN__) {
    // --- 运行在 Qiankun 环境下 ---
    // 在 Qiankun 环境下，我们假定基座应用已经处理了认证。
    // 如果基座允许子应用加载，说明用户已经登录。
    // 所以，对于标记了 requiresAuth 的路由，我们信任基座，直接放行。
    console.log(`[子应用路由守卫 - Qiankun] 导航到: ${to.path}, 信任基座认证.`);

    // 如果需要在子应用内部进行更细粒度的权限（如角色）检查，可以在这里添加逻辑
    // 例如：检查全局状态中的用户信息是否满足路由的 meta 要求 (requiresAdmin, requiresRole etc.)

    next(); // 直接放行
  } else {
    // --- 独立运行模式 ---
    console.log('[子应用路由守卫 - 独立运行] 执行独立运行时的认证检查...');
    if (requiresAuth) {
      // 独立运行时，检查 localStorage 中是否存在有效 token
      const loggedInStandalone = hasValidTokenInStandalone(); // 使用上面定义的检查函数

      console.log(`[子应用路由守卫 - 独立运行] 导航到: ${to.path}, 需要认证: ${requiresAuth}, Token 有效: ${loggedInStandalone}`);

      if (loggedInStandalone) {
        // 独立运行且检测到有效 Token，允许访问
        console.log('[子应用路由守卫 - 独立运行] 允许访问');
        next();
      } else {
        // 独立运行、无有效 Token 且访问受保护页面 -> 重定向到基座登录页
        // 这里的 '/login' 应该是基座应用的登录路由
        const loginUrl = `${mainAppBaseUrl}/login`; // 拼接基座登录页完整 URL
        console.warn(`[子应用路由守卫 - 独立运行] 未登录尝试访问受保护路由 ${to.path}，重定向到主应用登录页: ${loginUrl}`);
        window.location.replace(loginUrl); // 使用 replace 跳转，避免在子应用历史记录中留下痕迹
        // next(false); // 也可以选择阻止导航，但跳转更明确
      }
    } else {
      // 访问不需要认证的页面（如果您的子应用有这样的页面），直接放行
      console.log(`[子应用路由守卫 - 独立运行] 导航到: ${to.path}, 无需认证，允许访问`);
      next();
    }
  }
});
// --- 路由守卫结束 ---


export default router
