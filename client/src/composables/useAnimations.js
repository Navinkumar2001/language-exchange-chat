import { gsap } from 'gsap'

export function useAnimations() {
  const animateMessageIn = (element, isPrivate = false) => {
    const animation = isPrivate 
      ? { opacity: 0, x: -30, scale: 0.9 }
      : { opacity: 0, y: 20, rotationX: -15 }
    
    return gsap.fromTo(element, animation, {
      opacity: 1, 
      y: 0, 
      x: 0, 
      scale: 1, 
      rotationX: 0,
      duration: 0.4,
      ease: 'back.out(1.7)'
    })
  }

  const animateTypingIndicator = (element) => {
    return gsap.fromTo(element,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3 }
    )
  }

  const animatePrivateChatBanner = (element) => {
    return gsap.fromTo(element,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.3 }
    )
  }

  const animateTranslationAppear = (element) => {
    return gsap.fromTo(element,
      { opacity: 0, height: 0 },
      { opacity: 1, height: 'auto', duration: 0.3 }
    )
  }

  const animateButtonHover = (element) => {
    return gsap.to(element, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  const animateButtonLeave = (element) => {
    return gsap.to(element, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    })
  }

  return {
    animateMessageIn,
    animateTypingIndicator,
    animatePrivateChatBanner,
    animateTranslationAppear,
    animateButtonHover,
    animateButtonLeave
  }
}