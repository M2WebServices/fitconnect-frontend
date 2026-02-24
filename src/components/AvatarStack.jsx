function AvatarStack({ avatars }) {
  return (
    <div className="avatar-stack">
      {avatars.map((avatar, index) => (
        <img
          key={avatar.alt + index}
          src={avatar.src}
          alt={avatar.alt}
          className="avatar-stack-item"
        />
      ))}
    </div>
  );
}

export default AvatarStack;
