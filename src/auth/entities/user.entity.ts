import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Purchase } from "../../purchases/entities/purchase.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId: string;

  @Column("text", { unique: true })
  userEmail: string;

  @Column("text")
  userPassword: string;

  @Column("text")
  userName: string;

  @Column("simple-array", { default: "Customer" })
  userRoles: string[];

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases: Purchase[];
}
