import { Injectable } from '@nestjs/common';
import { Token } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { generate } from 'randomstring';
import { isNotEmpty } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { CreateTokenDto } from './dto/create-token.dto';

@Injectable()
export class TokenService {
  protected relations: FindOptionsRelations<Token> = {
    user: true,
  };
  constructor(@InjectRepository(Token) private tokenRepo: Repository<Token>) {}

  generateToken() {
    return generate({ length: 64, charset: 'alphanumeric' });
  }

  async create(createTokenInput: CreateTokenDto) {
    let token: string, tokenExist: boolean;
    do {
      token = this.generateToken();
      tokenExist = isNotEmpty(await this.tokenRepo.findOneBy({ token }));
    } while (tokenExist);
    const createdToken = await this.tokenRepo.save({
      id: uuidv4(),
      ...createTokenInput,
      token,
    });
    return await this.tokenRepo.findOne({
      where: { id: createdToken.id },
      relations: this.relations,
    });
  }
}
