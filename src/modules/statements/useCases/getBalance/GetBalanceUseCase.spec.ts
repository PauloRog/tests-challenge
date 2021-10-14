import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe('Get balance', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it('Should be able to get a balance', async () => {
    const user = await usersRepository.create({
      name: 'User',
      email: 'user@test.com',
      password: '123456',
    });

    const deposit = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit test',
    });

    const withdraw = await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'Withdraw test',
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response).toStrictEqual({
      statement: [deposit, withdraw],
      balance: 50,
    });
  });

  it('Should not be able to get a balance with a non-existent user', async () => {
    expect(async () => {
      await statementsRepository.create({
        user_id: 'non-existent',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Deposit test',
      });

      await getBalanceUseCase.execute({
        user_id: 'non-existent',
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});