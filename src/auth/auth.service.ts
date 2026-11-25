import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "./dto/login.user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findOneBy({
      userEmail: createUserDto.userEmail,
    });
    if (existing) {
      throw new ConflictException("El correo ya está registrado");
    }
    const user = this.userRepository.create({
      ...createUserDto,
      userPassword: await bcrypt.hash(createUserDto.userPassword, 10),
      userRoles: ["Customer"],
    });
    const saved = await this.userRepository.save(user);
    const result = { ...saved };
    delete (result as Partial<User>).userPassword;
    return result;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { userEmail: loginUserDto.userEmail },
    });
    if (!user) throw new UnauthorizedException("Credenciales incorrectas");
    const match = await bcrypt.compare(
      loginUserDto.userPassword,
      user.userPassword,
    );
    if (!match) throw new UnauthorizedException("Credenciales incorrectas");
    const payload = {
      userEmail: user.userEmail,
      userRoles: user.userRoles,
      userId: user.userId,
    };
    return this.jwtService.sign(payload);
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: { purchases: true },
    });
    if (!user) throw new UnauthorizedException();
    const result = { ...user };
    delete (result as Partial<User>).userPassword;
    return result;
  }
}
