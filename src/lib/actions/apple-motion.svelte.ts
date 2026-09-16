import { animate, cancel } from 'motion';
import { spring } from 'svelte/motion';
import { cubicIn, cubicOut } from 'svelte/easing';
import { browser } from '$app/environment';

// 认证 Apple 风格弹簧曲线
const APPLE_CURVE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// 创建可中断的物理动画
export function applePress(element: HTMLElement, options: {
  scale?: number;
  duration?: number;
  damping?: number;
} = {}) {
  const config = {
    scale: 0.97,
    duration: 100,
    damping: 1.0,
    ...options
  };

  let startTime: number | null = null;
  let currentScale = 1;
  let rafId: number;

  // 动画状态
  const press = spring(1);
  const release = spring(1);

  // 处理按下的动画
  const handlePressStart = (e: Event) => {
    // 如果是触摸或鼠标事件
    const isTouch = e.type === 'touchstart';
    const touch = isTouch ? (e as TouchEvent).touches[0] : (e as PointerEvent).clientX;
    
    // 只在左上角开始，避免滥用
    const rect = element.getBoundingClientRect();
    if (!rect) return;
    
    // 确保点击在按钮/卡片区域内
    const x = isTouch ? touch.clientX - rect.left : (e as PointerEvent).clientX - rect.left;
    const y = isTouch ? touch.clientY - rect.top : (e as PointerEvent).clientY - rect.top;
    
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;
    
    // 立即更新动画状态
    currentScale = config.scale;
    element.style.scale = `${currentScale}`;
    
    // 启动弹簧动画（可中断）
    const anim = animate(element, { 
      scale: config.scale,
    }, {
      type: 'spring',
      damping: config.damping,
      stiffness: 200,
    });
  
    // 记录动画 ID 供后续取消
    element._applePressAnim = anim;
  };

  // 处理放开的动画
  const handleEnd = () => {
    // 取消当前动画
    if (element._applePressAnim) {
      cancel(element._applePressAnim);
      element._applePressAnim = null;
    }
    
    // 动画回原始状态
    currentScale = 1;
    element.style.scale = '1';
  };

  // 绑定事件
  element.addEventListener('pointerdown', handlePressStart);
  element.addEventListener('pointerup', handleEnd);
  element.addEventListener('touchstart', handlePressStart);
  element.addEventListener('touchend', handleEnd);
  
  // 清理函数
  return {
    destroy() {
      element.removeEventListener('pointerdown', handlePressStart);
      element.removeEventListener('pointerup', handleEnd);
      element.removeEventListener('touchstart', handlePressStart);
      element.removeEventListener('touchend', handleEnd);
      if (element._applePressAnim) {
        cancel(element._applePressAnim);
        element._applePressAnim = null;
      }
    }
  };
}

// 创建滚动显现的弹簧动画
export function revealSpring(element: HTMLElement, options: {
  threshold?: number;
  rootMargin?: string;
  damping?: number;
  stiffness?: number;
} = {}) {
  // 如果用户偏好减少移动，则使用简单动画
  if (prefersReducedMotion()) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    return { destroy: () => {} };
  }

  const config = {
    threshold: 0.1,
    rootMargin: '0px',
    damping: 1.0,
    stiffness: 100,
    ...options
  };

  // 创建淡入 + 滑动动画
  const initialY = 20;
  const opacity = 0;
  const transform = `translateY(${initialY}px)`;

  element.style.opacity = String(opacity);
  element.style.transform = transform;
  element.style.willChange = 'opacity, transform';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 启动弹簧动画
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        element.style.willChange = 'none';
        
        // 添加简单的淡入特效
        animate(element, { 
          opacity: 1,
          transform: 'translateY(0)',
        }, {
          type: 'spring',
          damping: config.damping,
          stiffness: config.stiffness,
        });
        
        // 停止观察
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: config.threshold,
    rootMargin: config.rootMargin
  });

  observer.observe(element);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

// 创建可中断的指示器滑动动画（用于移动 Tab）
export function indicatorSpring(element: HTMLElement) {
  if (prefersReducedMotion()) {
    // 简单版本
    element.style.transition = 'transform 150ms ease-out';
    return { destroy: () => {} };
  }

  // 使用弹簧动画
  const Anim = spring(0);
  
  let rafId: number;
  let lastX = 0;
  let targetX = 0;
  let velocity = 0;

  // 监听移动
  function updateIndicator(x: number) {
    targetX = x;
    // 计算相对位置差
    const delta = targetX - lastX;
    velocity = delta;
    lastX = targetX;
    
    // 应用动画
    const translation = `${targetX}px`;
    element.style.transform = `translateX(${translation})`;
    
    rafId = requestAnimationFrame(updateIndicator);
  }

  // 开始监听
  updateIndicator(0);

  function handlePointerMove(e: PointerEvent) {
    // 根据事件更新位置
    if (element._parent) {
      const rect = element._parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      targetX = x;
    }
  }

  element.addEventListener('pointermove', handlePointerMove);

  return {
    destroy() {
      cancelAnimationFrame(rafId);
      element.removeEventListener('pointermove', handlePointerMove);
    }
  };
}

// 对滚动动画进行弹性的边界处理
export function rubberBandScroll(element: HTMLElement) {
  if (prefersReducedMotion()) {
    // 简单版本
    element.style.getPropertyValue('--travel') = '';
    return { destroy: () => {} };
  }

  const observe = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        // 处理橡胶边界
        const observer = new MutationObserver(() => {
          const el = entry.target;
          const scroll = el.scrollTop;
          const max = el.scrollHeight - el.clientHeight;
          
          if (scroll < 0) {
            // 滚动到顶部
            const stretch = Math.abs(scroll) * 0.3;
            el.style.transform = `scale(${1 - stretch / 100})`;
            el.style.transformOrigin = 'top center';
          } else if (scroll > max) {
            // 滚动到底部
            const stretch = Math.abs(scroll - max) * 0.3;
            el.style.transform = `scale(${1 - stretch / 100})`;
            el.style.transformOrigin = 'bottom center';
          } else {
            el.style.transform = 'scale(1)';
            el.style.transformOrigin = 'center center';
          }
        });
        
        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0 });
  
  observe.observe(element);
  
  return {
    destroy() {
      observe.disconnect();
    }
  };
}
