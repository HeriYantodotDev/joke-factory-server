import { app } from './app';
import { sequelize } from './config/database';
import { AuthHelperModel } from './models';

const PORT = 3000;

sequelize.sync();

// .then(async () => {
//   await UserHelperModel.addMultipleNewUsers(25);
// });

AuthHelperModel.scheduleCleanUp();

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening to port ... ${PORT}`);
});
