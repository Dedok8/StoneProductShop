import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ example: 'a3f1c2e4-1234-5678-abcd-000000000001' })
  id: string;

  @ApiProperty({ example: 'White Carrara Marble Slab' })
  name: string;

  @ApiProperty({ example: 'white-carrara-marble-slab-a1b2c3d4' })
  slug: string;

  @ApiPropertyOptional({ example: 'Premium Italian marble, polished finish' })
  description: string | null;

  @ApiProperty({ example: 149.99 })
  price: number;

  @ApiProperty({ example: 10 })
  stock: number;

  @ApiProperty({ example: true })
  isInStock: boolean;

  @ApiProperty({ example: ['https://cdn.example.com/img1.jpg'] })
  images: string[];

  @ApiProperty({ example: 'a3f1c2e4-0000-0000-0000-000000000001' })
  categoryId: string;

  @ApiProperty({ example: 'a3f1c2e4-0000-0000-0000-000000000002' })
  ownerId: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
