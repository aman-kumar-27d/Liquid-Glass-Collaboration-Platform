import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'companies' })
export class Company extends BaseEntity {
  @Column({ length: 160 })
  name!: string;

  @Index({ unique: true })
  @Column({ length: 160 })
  domain!: string;

  @Column({ length: 32, default: 'trial' })
  plan!: string;

  @OneToMany(() => User, (user) => user.company)
  users!: User[];
}
