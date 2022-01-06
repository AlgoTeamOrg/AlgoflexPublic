import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn("uuid")
  uid: string;

  @Column()
  language: string;

  @Column()
  questionId: string;

  @Column()
  solution: string;

  @Column()
  userId: string;

  @Column()
  status: string;
}
