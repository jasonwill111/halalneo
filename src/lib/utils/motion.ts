import { spring } from 'svelte/motion';
import { browser } from '$app/environment';
import { getNetworkInfo } from '#lib/network.js';

// 根据设备能力 + 网络条件选择动画策略
export function canUseMotion(): boolean {
  if (!browser) return false;

  // 用户偏好减少动画
  if (prefersReducedMotion()) return false;

  // 低带宽 / Save-Data → 跳过动画（JS 预算敏感）
  const net = getNetworkInfo();
  if (net.saveData) return false;

  // 检查硬件并发线程数
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return false;

  // 检查是否是低端 Android 设备
  if (
    navigator.userAgent.includes('Mobile') &&
    navigator.hardwareConcurrency &&
    navigator.hardwareConcurrency < 2
  ) {
    return false;
  }

  return true;
}

// 检查用户是否偏好减少动画
export function prefersReducedMotion(): boolean {
  if (!browser) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// 检查网络条件和预算策略
export function getAnimationBudget(): 'aggressive' | 'balanced' | 'deliberate' {
  if (prefersReducedMotion()) return 'aggressive';

  try {
    // Save-Data 模式 → 立即降级
    const net = getNetworkInfo();
    if (net.saveData) return 'aggressive';

    const perfs = performance.getEntriesByType('longtask');
    if (perfs.length > 3) return 'aggressive';

    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } })
      .memory;
    if (memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
      return 'aggressive';
    }

    return 'balanced';
  } catch {
    return 'balanced';
  }
}

// 创建延迟动画（Svelte best practice）
export function lazySpring(
  initial: number,
  damping?: string | number,
  stiffness?: string | number
) {
  return spring(initial).setDamping(0.8);
}

// 生成优化过的动画选项（适配所有设备）
export function getAnimationOptions(): {
  duration: number;
  easing: 'ease-out' | 'cubic-bezier';
  delay: number;
} {
  const budget = getAnimationBudget();
  
  switch (budget) {
    case 'aggressive':
      return {
        duration: 300,
        easing: 'ease-out',
        delay: 0
      };
    case 'balanced':
      return {
        duration: 500,
        easing: 'ease-out',
        delay: 0
      };
    default:
      return {
        duration: 700,
        easing: 'ease-out',
        delay: 200
      };
  }
}

// 创建弹簧预定义配置（适配 Apple Design）
export const springConfig = {
  default: { damping: 1.0, stiffness: 100, mass: 1 },
  fast: { damping: 1.0, stiffness: 200, mass: 1, duration: 200 },
  slow: { damping: 1.0, stiffness: 50, mass: 1, duration: 500 },
  bounce: { damping: 0.8, stiffness: 200, mass: 1, duration: 400 },
};

// 创建可观测的弹簧
export function observableSpring<T>(initial: T, config = springConfig.default): {
  value: T;
  update: (newVal: T) => void;
  subscribe: (fn: (val: T) => void) => void;
} {
  const sub = spring(initial, config);
  
  return {
    value: sub,
    update: (newVal: T) => {
      sub.set(newVal, { overlap: true });
    },
    subscribe: (fn: (val: T) => void) => {
      const unsub = sub.subscribe(fn);
      return unsub;
    }
  };
}
