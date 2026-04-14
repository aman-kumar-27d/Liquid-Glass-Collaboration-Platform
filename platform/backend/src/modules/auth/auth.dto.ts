import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterOwnerDto {
  @IsString()
  @Length(2, 160)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(8, 72)
  password!: string;

  @IsString()
  @Length(2, 160)
  companyName!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  companyDomain!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken!: string;
}
