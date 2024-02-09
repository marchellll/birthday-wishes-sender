import {
  Column,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript';


@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  id: number;

  @Column
  firstname: string;

  @Column
  lastname: string;

  @Column
  email: string;

  @Column
  timezone: string;

  @Column
  birthdate: Date;

  @Column
  created_at: Date;

  @Column
  updated_at: Date;

  @Column
  deleted_at: Date;
}
