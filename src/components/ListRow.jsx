function ListRow({ leading, title, subtitle, meta }) {
  return (
    <div className="list-row">
      {leading && <div className="list-leading">{leading}</div>}
      <div className="list-content">
        <p className="list-title">{title}</p>
        {subtitle && <p className="list-subtitle">{subtitle}</p>}
      </div>
      {meta && <div className="list-meta">{meta}</div>}
    </div>
  );
}

export default ListRow;
