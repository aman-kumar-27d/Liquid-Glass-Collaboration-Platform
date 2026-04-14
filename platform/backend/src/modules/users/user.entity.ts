import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { BaseEntity } from '../../database/entities/base.entity';
import { Company } from '../companies/company.entity';

@Entity({ name: 'users' })
@Index(['companyId', 'email'], { unique: true })
@Index(['companyId', 'role', 'isActive'])
export class User extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Column({ length: 160 })
  name!: string;

  @Column({ length: 190 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl?: string | null;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
