import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { RoomType } from '../../common/enums/room-type.enum';
import { BaseEntity } from '../../database/entities/base.entity';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { RoomMember } from './room-member.entity';

@Entity({ name: 'rooms' })
@Index(['companyId', 'type'])
export class Room extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'simple-enum', enum: RoomType })
  type!: RoomType;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @OneToMany(() => RoomMember, (member) => member.room)
  members!: RoomMember[];
}
