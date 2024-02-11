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
  tableName: 'scheduled_messages',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class ScheduledMessages extends Model {
  @PrimaryKey
  @Column({
    type: DataType.BIGINT.UNSIGNED,
    autoIncrement: true,
  })
  id: number;

  @Column
  user_id: number;

  @Column
  recipient: string;

  @Column
  // soft-enum: email, right now only support email
  recipient_type: string;

  @Column
  scheduled_at: Date;

  // title and body should be in separate table, `message_templates`
  // that way, we can reuse the same template for different users
  // but for simplicity, we will just put it here
  // but this makes the responsibility of defining the message to the creator
  @Column
  title: string;

  @Column
  body: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}
