import dotenv from 'dotenv';
dotenv.config({path: `.env.${process.env.NODE_ENV}`});
import { sequelize } from '../config/database';
import { Auth, User } from '../models';
import { 
  AuthHelperModel,
  UserHelperModel
} from '../models';


beforeAll( async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach( async() => {
  await User.destroy({truncate: true});
  await Auth.destroy({truncate: true});
});

describe('Scheduled Token Clean Up', () => {
  test('clears the expired token with scheduled task', async () => {
    jest.useFakeTimers();
    const savedUser = await UserHelperModel.addMultipleNewUsers(1);
    const token = 'test-token';
    const eightDaysAgo = AuthHelperModel.maxAgeTokenByDay(8);
    await Auth.create({
      token,
      userID: savedUser[0].id,
      lastUsedAt: eightDaysAgo,
    });

    AuthHelperModel.scheduleCleanUp();

    jest.advanceTimersByTime((60*60*1000) + 5000 );
    const tokenInDB = await Auth.findOne({
      where: {token: token},
    });

    expect(tokenInDB).toBeNull();

  });
});


