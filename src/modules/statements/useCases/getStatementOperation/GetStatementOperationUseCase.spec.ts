import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('Get statement operation', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it('Should be able to get the statement operation', async () => {
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

    const statement = await getStatementOperationUseCase.execute({
      statement_id: deposit.id as string,
      user_id: user.id as string,
    });

    expect(statement).toBe(deposit);
  });

  it('Should be able to get the statement operation', async () => {
    expect(async () => {
      const statement = await statementsRepository.create({
        user_id: 'non-existent',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Deposit test',
      });

      await getStatementOperationUseCase.execute({
        statement_id: statement.id as string,
        user_id: 'non-existent',
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should be able to get the statement operation', async () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: 'User',
        email: 'user@test.com',
        password: '123456',
      });

      await getStatementOperationUseCase.execute({
        statement_id: 'non-existent',
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});