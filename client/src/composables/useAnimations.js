import { gsap } from 'gsap'

export function useAnimations() {
  const animateMessageIn = (element, isPrivate = false) => {
    const animation = isPrivate 
      ? { opacity: 0, x: -50, scale: 0.8, rotationY: -15 }
      : { opacity: 0, y: 30, scale: 0.9, rotationX: -10 }
    
    return gsap.fromTo(element, animation, {
      opacity: 1, 
      y: 0, 
      x: 0, 
      scale: 1, 
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.8)'
    })
  }

  const animateTypingIndicator = (element) => {
    gsap.fromTo(element,
      { opacity: 0, y: 15, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
    )
    
    // Add pulsing dots animation
    const dots = element.querySelector('.typing-dots')
    if (dots) {
      gsap.to(dots, {
        opacity: 0.3,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      })
    }
  }

  const animatePrivateChatBanner = (element) => {
    return gsap.fromTo(element,
      { height: 0, opacity: 0, scale: 0.95 },
      { height: 'auto', opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
    )
  }

  const animateTranslationAppear = (element) => {
    return gsap.fromTo(element,
      { opacity: 0, height: 0, y: -10 },
      { opacity: 1, height: 'auto', y: 0, duration: 0.4, ease: 'power2.out' }
    )
  }

  const animateButtonHover = (element) => {
    return gsap.to(element, {
      scale: 1.1,
      y: -2,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const animateButtonLeave = (element) => {
    return gsap.to(element, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const createFloatingParticles = (container) => {
    const particles = []
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div')
      particle.className = 'floating-particle'
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(102,126,234,0.3));
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
      `
      container.appendChild(particle)
      particles.push(particle)
      
      gsap.set(particle, {
        x: Math.random() * container.offsetWidth,
        y: Math.random() * container.offsetHeight
      })
      
      gsap.to(particle, {
        y: '-=100',
        x: `+=${Math.random() * 40 - 20}`,
        opacity: 0,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        ease: 'power1.out',
        delay: Math.random() * 2
      })
    }
    return particles
  }

  const animateParticipantJoin = (element) => {
    return gsap.fromTo(element,
      { opacity: 0, scale: 0, rotation: -180 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.7)' }
    )
  }

  const animateEmojiPicker = (element) => {
    return gsap.fromTo(element,
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
    )
  }

  const animateMessageSend = (inputElement) => {
    gsap.to(inputElement, {
      scale: 0.98,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    })
  }

  const createRippleEffect = (element, x, y) => {
    const ripple = document.createElement('div')
    ripple.className = 'ripple-effect'
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.6), transparent);
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
    `
    element.appendChild(ripple)
    
    gsap.to(ripple, {
      width: 100,
      height: 100,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    })
  }

  return {
    animateMessageIn,
    animateTypingIndicator,
    animatePrivateChatBanner,
    animateTranslationAppear,
    animateButtonHover,
    animateButtonLeave,
    createFloatingParticles,
    animateParticipantJoin,
    animateEmojiPicker,
    animateMessageSend,
    createRippleEffect
  }
}