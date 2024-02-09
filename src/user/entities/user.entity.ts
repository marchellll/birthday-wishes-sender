import {
  Column,
  Model,
  PrimaryKey,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';


@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT.UNSIGNED,
  })
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

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}
