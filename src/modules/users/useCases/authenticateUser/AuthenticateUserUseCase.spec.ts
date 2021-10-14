import { hash } from 'bcryptjs';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let usersRepository: IUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate user', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
  });

  it('Should be able to authenticate', async () => {
    await usersRepository.create({
      name: 'User',
      email: 'user@test.com',
      password: await hash('123456', 8),
    });

    const response = await authenticateUserUseCase.execute({
      email: 'user@test.com',
      password: '123456',
    });

    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('user');
  });

  it('Should not be able to authenticate with a non-existent user', async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'non@existent.com',
        password: 'non-existent',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should not be able to authenticate with a wrong password', async () => {
    expect(async () => {
      await usersRepository.create({
        name: 'User',
        email: 'user@test.com',
        password: await hash('123456', 8),
      });

      await authenticateUserUseCase.execute({
        email: 'test@test.com',
        password: 'wrong-password',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate with a wrong email', async () => {
    expect(async () => {
      await usersRepository.create({
        name: 'User',
        email: 'user@test.com',
        password: await hash('123456', 8),
      });

      const response = await authenticateUserUseCase.execute({
        email: 'non@existent.com',
        password: '1234',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});