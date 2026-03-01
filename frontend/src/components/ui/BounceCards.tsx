import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';

interface CardData {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface BounceCardsProps {
  className?: string;
  cards: CardData[];
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
}

export default function BounceCards({
  className = '',
  cards = [],
  containerWidth = 1200,
  containerHeight = 480,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(-8deg) translate(-380px)',
    'rotate(-4deg) translate(-190px)',
    'rotate(0deg)',
    'rotate(4deg) translate(190px)',
    'rotate(8deg) translate(380px)'
  ],
  enableHover = true
}: BounceCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bounce-card',
        { scale: 0 },
        {
          scale: 1,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [animationDelay, animationStagger, easeType]);

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  const pushSiblings = (hoveredIdx: number) => {
    const q = gsap.utils.selector(containerRef);
    if (!enableHover || !containerRef.current) return;

    cards.forEach((_, i) => {
      const selector = q(`.bounce-card-${i}`);
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotation = getNoRotationTransform(baseTransform);
        gsap.to(selector, {
          transform: noRotation,
          zIndex: 10,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
      } else {
        const offsetX = i < hoveredIdx ? -80 : 80;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);

        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(selector, {
          transform: pushedTransform,
          zIndex: 5 - distance,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current) return;
    const q = gsap.utils.selector(containerRef);

    cards.forEach((_, i) => {
      const selector = q(`.bounce-card-${i}`);
      gsap.killTweensOf(selector);

      const baseTransform = transformStyles[i] || 'none';
      gsap.to(selector, {
        transform: baseTransform,
        zIndex: cards.length - Math.abs(i - Math.floor(cards.length / 2)),
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
    });
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={containerRef}
      style={{
        width: containerWidth,
        height: containerHeight
      }}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const zIndex = cards.length - Math.abs(idx - Math.floor(cards.length / 2));
        
        return (
          <div
            key={idx}
            className={`bounce-card bounce-card-${idx} absolute w-[240px] h-[360px] rounded-3xl overflow-hidden cursor-pointer group`}
            style={{
              boxShadow: '0 10px 40px rgba(143, 188, 148, 0.15)',
              transform: transformStyles[idx] || 'none',
              zIndex
            }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-sage-light/30 to-white" />
            
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage via-sage/70 to-sage" />
            
            {/* Border with hover effect */}
            <div className="absolute inset-0 rounded-3xl border-2 border-sage/20 group-hover:border-sage/40 transition-colors duration-300" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center h-full pt-12 pb-8 px-6 text-center">
              {/* Icon with enhanced styling */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-sage/20 rounded-2xl blur-xl" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-sage via-sage to-sage/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-white drop-shadow-sm" />
                </div>
              </div>
              
              {/* Title with decorative underline */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground mb-2 leading-tight tracking-tight">
                  {card.title}
                </h3>
                <div className="w-12 h-0.5 mx-auto bg-gradient-to-r from-transparent via-sage to-transparent" />
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {card.description}
              </p>
              
              {/* Bottom decorative element */}
              <div className="mt-auto pt-4">
                <div className="w-8 h-1 rounded-full bg-sage/30 mx-auto" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
