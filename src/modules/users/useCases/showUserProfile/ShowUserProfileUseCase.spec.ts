import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { ShowUserProfileError } from './ShowUserProfileError';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let usersRepository: IUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show user profile', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it('Should be able to show a user', async () => {
    const user = await usersRepository.create({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    const response = await showUserProfileUseCase.execute(user.id as string);

    expect(response).toBe(user);
  });

  it('Should not be able to show a non-existent user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute('non-existent-user-id');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});