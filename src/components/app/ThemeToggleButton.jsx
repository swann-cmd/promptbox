import PropTypes from 'prop-types';
import { SunIcon, MoonIcon } from '../ui/icons';
import { useTheme } from '../../context/ThemeContext';

function ThemeToggleButton({ className }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // 避免服务端渲染不匹配
  if (!mounted) {
    return (
      <button className={className} disabled>
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={className}
      title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

ThemeToggleButton.propTypes = {
  className: PropTypes.string,
};

ThemeToggleButton.defaultProps = {
  className: '',
};

export default ThemeToggleButton;
