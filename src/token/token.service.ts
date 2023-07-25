import { Injectable } from '@nestjs/common';
import { Token } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generate } from 'randomstring';
import { isNotEmpty } from 'class-validator';
import { BaseService } from '../shared/services/base.service';

@Injectable()
export class TokenService extends BaseService<Token> {
  constructor(@InjectRepository(Token) private tokenRepo: Repository<Token>) {
    super(tokenRepo);
  }

  generateToken() {
    return generate({ length: 64, charset: 'alphanumeric' });
  }

  async create(createTokenInput: Partial<Token>) {
    let token: string, tokenExist: boolean;
    do {
      token = this.generateToken();
      tokenExist = isNotEmpty(await this.findOneBy({ token }));
    } while (tokenExist);
    const createdToken = await this.tokenRepo.save({
      ...createTokenInput,
      token,
    });
    return await this.findOneBy({ id: createdToken.id });
  }
}
