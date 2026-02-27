
import { firebaseService } from './firebaseService';
import { authServiceLegacy } from './authServiceLegacy';
import { proxyFirebaseService } from './proxyFirebaseService';

// 默认走代理模式，避免检测期间用户已点击登录
let _service: any = proxyFirebaseService;

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

// 启动时检测：如果 Firebase 可直连则切换到直连模式，否则保持代理
checkFirebaseAvailable().then((available) => {
  if (available) {
    console.log('[AuthService] Firebase 直连可用，切换直连模式');
    _service = firebaseService;
  } else {
    console.log('[AuthService] Firebase 不可直连，使用后端代理模式');
  }
});

// 代理：所有调用转发到当前激活的 service
export const authService = new Proxy({} as typeof firebaseService, {
  get(_target, prop) {
    return (_service as any)[prop];
  }
});
