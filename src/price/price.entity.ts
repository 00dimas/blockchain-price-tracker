import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Price {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  chain!: string;

  @Column('decimal', { precision: 38, scale: 18 })
  price!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
