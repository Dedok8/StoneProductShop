import type { InspirationImageEntity } from '@/model/inspiration/domain/entities';

export interface ICreateInspirationImageData {
  imageUrl: string;
  alt?: string;
}

export interface IUpdateInspirationImageData {
  imageUrl?: string;
  alt?: string;
}

export interface IInspirationImageRepository {
  findAllOrdered(): Promise<InspirationImageEntity[]>;
  findById(id: string): Promise<InspirationImageEntity | null>;
  create(data: ICreateInspirationImageData): Promise<InspirationImageEntity>;
  update(
    id: string,
    data: IUpdateInspirationImageData,
  ): Promise<InspirationImageEntity | null>;
  delete(id: string): Promise<void>;
}

export const INSPIRATION_IMAGE_REPOSITORY = Symbol(
  'INSPIRATION_IMAGE_REPOSITORY',
);
