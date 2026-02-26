
import { firebaseService } from './firebaseService';
import { authServiceLegacy } from './authServiceLegacy';

// 根据网络环境自动选择服务：Firebase 或 localStorage 降级
let _service: any = firebaseService;

// 检测 Firebase 是否可用（国内网络可能无法访问）
const checkFirebaseAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch('https://firestore.googleapis.com/v1/projects/artislife-7384f/databases/(default)/documents/ugc?pageSize=1', {
      signal: controller.signal,
      method: 'GET',
    });
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
};

// 启动时检测，降级到 localStorage
checkFirebaseAvailable().then(available => {
  if (!available) {
    console.warn('[AuthService] Firebase 不可达，切换到本地存储模式');
    _service = authServiceLegacy;
  }
});

// 代理：所有调用转发到当前激活的 service
export const authService = new Proxy({} as typeof firebaseService, {
  get(_target, prop) {
    return (_service as any)[prop];
  }
});
