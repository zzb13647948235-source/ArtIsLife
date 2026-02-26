
import { firebaseService } from './firebaseService';
import { authServiceLegacy } from './authServiceLegacy';
import { proxyFirebaseService } from './proxyFirebaseService';

// 根据网络环境自动选择服务
let _service: any = firebaseService;

// 检测 Firebase 是否可直连
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

// 检测后端代理是否可用
const checkProxyAvailable = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/firebase/ugc?action=list');
    return res.ok;
  } catch {
    return false;
  }
};

// 启动时检测：优先直连 Firebase，其次走代理，最后降级 localStorage
checkFirebaseAvailable().then(async (available) => {
  if (available) {
    console.log('[AuthService] Firebase 直连可用');
    _service = firebaseService;
  } else {
    const proxyAvailable = await checkProxyAvailable();
    if (proxyAvailable) {
      console.log('[AuthService] 切换到后端代理模式（国内网络）');
      _service = proxyFirebaseService;
    } else {
      console.warn('[AuthService] 代理不可用，降级到本地存储模式');
      _service = authServiceLegacy;
    }
  }
});

// 代理：所有调用转发到当前激活的 service
export const authService = new Proxy({} as typeof firebaseService, {
  get(_target, prop) {
    return (_service as any)[prop];
  }
});
