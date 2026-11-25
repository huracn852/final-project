import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Seat } from "../../seats/entities/seat.entity";

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn("uuid")
  purchaseId: string;

  @ManyToOne(() => User, (user) => user.purchases, { eager: true })
  user: User;

  @OneToOne(() => Seat, (seat) => seat.purchase, { eager: true })
  @JoinColumn()
  seat: Seat;

  @Column("numeric", { precision: 10, scale: 2 })
  totalPrice: number;

  @Column("varchar", { length: 30, default: "confirmed" })
  status: string;

  @CreateDateColumn()
  purchasedAt: Date;
}
