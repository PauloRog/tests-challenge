import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('CreateUserUseCase', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('Should be able to create a user', async () => {
    const response = await createUserUseCase.execute({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    expect(response).toHaveProperty('id');
  });

  it('Should not be able to create a duplicated user', async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'User',
        email: 'same@email.com',
        password: '1234',
      });

      await createUserUseCase.execute({
        name: 'User 2',
        email: 'same@email.com',
        password: '12345',
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});