interface EntityGridMapProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  className?: string;
}

function EntityGridMap<T>({
  items,
  getKey,
  renderItem,
  className,
}: EntityGridMapProps<T>) {
  return (
    <ul className={className ?? "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
      {items.map((item) => (
        <li key={getKey(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

export default EntityGridMap;
