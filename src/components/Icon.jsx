function Icon({ name, size = 20, ...props }) {
  return (
    <iconify-icon
      icon={name}
      style={{ fontSize: `${size}px`, display: 'inline-flex' }}
      {...props}
    />
  );
}

export default Icon;
