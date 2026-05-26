import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/User.schema';
import { CreateUserDto } from './dto/Create-user.dto';
import { UpdateUserDto } from './dto/Update-user.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Criar usuário ────────────────────────────────────────────────────
  async create(dto: CreateUserDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });

    if (exists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = new this.userModel({
      ...dto,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
    });

    return user.save();
  }

  // ─── Listar todos ─────────────────────────────────────────────────────
  async findAll(): Promise<UserDocument[]> {
    return this.userModel
      .find()
      .select('-password')
      .sort({ name: 1 })
      .lean();
  }

  // ─── Buscar por ID ────────────────────────────────────────────────────
  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .lean();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  // ─── Buscar por e-mail (uso interno) ─────────────────────────────────
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password')
      .lean();
  }

  // ─── Atualizar ────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    await this.findById(id); // garante que existe

    if (dto.email) {
      const conflict = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (conflict) {
        throw new ConflictException('E-mail já cadastrado por outro usuário');
      }
    }

    const updateData: Partial<UpdateUserDto & { password: string }> = {
      ...dto,
      ...(dto.email && { email: dto.email.toLowerCase() }),
    };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    const updated = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .lean();

    return updated;
  }

  // ─── Remover (soft delete via isActive) ───────────────────────────────
  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.userModel.findByIdAndUpdate(id, { isActive: false });
  }

  // ─── Seed: garante que o admin inicial existe ─────────────────────────
  async ensureAdminExists(): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@bolao.com';
    const exists = await this.userModel.findOne({ email });

    if (!exists) {
      const password = process.env.ADMIN_PASSWORD ?? 'Admin@123';
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      await this.userModel.create({
        name: process.env.ADMIN_NAME ?? 'Administrador',
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      });

      console.log(`✅ Admin criado: ${email}`);
    }
  }
}