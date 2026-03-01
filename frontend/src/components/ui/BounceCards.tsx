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
  containerWidth = 800,
  containerHeight = 280,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(-8deg) translate(-240px)',
    'rotate(-4deg) translate(-120px)',
    'rotate(0deg)',
    'rotate(4deg) translate(120px)',
    'rotate(8deg) translate(240px)'
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
            className={`bounce-card bounce-card-${idx} absolute w-[140px] h-[210px] rounded-2xl overflow-hidden cursor-pointer`}
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              transform: transformStyles[idx] || 'none',
              zIndex
            }}
            onMouseEnter={() => pushSiblings(idx)}
            onMouseLeave={resetSiblings}
          >
            {/* Card background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl border border-slate-600/50" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage/80 flex items-center justify-center mb-3 shadow-lg">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xs font-bold text-white mb-2 leading-tight">
                {card.title}
              </h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
