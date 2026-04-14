import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Length(2, 160)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  domain!: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @Length(2, 160)
  name?: string;

  @IsOptional()
  @IsString()
  plan?: string;
}
