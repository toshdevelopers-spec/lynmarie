import { Shirt, Sparkles } from 'lucide-react';

const Loader = ({ size = 'medium', className = '', label = 'Loading your style', fullScreen = false }) => {
  const sizes = { small: 'is-small', medium: 'is-medium', large: 'is-large' };

  return (
    <div className={`fashion-loader ${fullScreen ? 'fashion-loader--screen' : ''} ${className}`} role="status" aria-live="polite" aria-busy="true">
      <span className={`fashion-loader__mark ${sizes[size] || sizes.medium}`} aria-hidden="true">
        <Shirt className="fashion-loader__shirt" strokeWidth={1.7} />
        <Sparkles className="fashion-loader__sparkle" strokeWidth={2} />
      </span>
      <span className="fashion-loader__label">{label}<span className="fashion-loader__dots" aria-hidden="true"><i /><i /><i /></span></span>
    </div>
  );
};

export default Loader;
