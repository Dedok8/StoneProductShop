
export interface WithTimestamps {
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface EntityFactory<TRaw, TEntity> {
  fromPersistence(raw: TRaw & { createdAt: Date; updatedAt: Date }): TEntity;
}

export function mapToEntity<TRaw extends WithTimestamps, TEntity>(
  raw: TRaw,
  entityClass: EntityFactory<TRaw, TEntity>,
): TEntity {
  return entityClass.fromPersistence({
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  });
}
