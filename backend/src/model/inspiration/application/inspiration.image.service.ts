import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateInspirationImageDto,
  UpdateInspirationImageDto,
} from '@/model/inspiration/application/dto';
import { InspirationImageMapper } from '@/model/inspiration/application/mapper';
import {
  INSPIRATION_IMAGE_REPOSITORY,
  type IInspirationImageRepository,
} from '@/model/inspiration/domain';
import { assertFound } from '@/shared';

@Injectable()
export class InspirationImageService {
  constructor(
    @Inject(INSPIRATION_IMAGE_REPOSITORY)
    private readonly inspirationImageRepository: IInspirationImageRepository,
  ) {}

  async findAll() {
    const images = await this.inspirationImageRepository.findAllOrdered();
    return InspirationImageMapper.toResponseList(images);
  }

  async findById(id: string) {
    const image = await this.inspirationImageRepository.findById(id);

    if (!image) throw new NotFoundException('Image not found');

    return InspirationImageMapper.toResponse(image);
  }

  async create(dto: CreateInspirationImageDto) {
    const image = await this.inspirationImageRepository.create({
      imageUrl: dto.imageUrl,
      alt: dto.alt ?? '',
    });

    return InspirationImageMapper.toResponse(image);
  }

  async update(id: string, dto: UpdateInspirationImageDto) {
    const image = assertFound(
      await this.inspirationImageRepository.update(id, dto),
      'Image not found',
    );
    return InspirationImageMapper.toResponse(image);
  }

  async delete(id: string) {
    assertFound(await this.inspirationImageRepository.findById(id));
    await this.inspirationImageRepository.delete(id);
  }
}
