const Button = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
