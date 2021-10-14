import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementError } from './CreateStatementError';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe('Create statement', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it('Should be able to create a deposit statement', async () => {
    const user = await usersRepository.create({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit test',
    });

    expect(deposit).toHaveProperty('id');
  });

  it('Should be able to create a withdraw statement', async () => {
    const user = await usersRepository.create({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 101,
      description: 'Deposit test',
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: 'Withdraw test',
    });

    expect(withdraw).toHaveProperty('id');
  });

  it('Should not be able to create a withdraw statement with funds', async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: 'User',
        email: 'test@test.com',
        password: '123456',
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'Withdraw test',
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('Should not be able to create a statement with a non-existent user', async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'non-existent',
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'Withdraw test',
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});