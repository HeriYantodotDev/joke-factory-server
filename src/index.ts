import { app } from './app';
import { sequelize } from './config/database';
import { AuthHelperModel } from './models';
import { logger, FileUtils} from './utils';

const PORT = process.env.port || 3000;

sequelize.sync();

AuthHelperModel.scheduleCleanUp();
FileUtils.removeUnusedAttachments();

app.listen(PORT, () => {
  logger.info(`Listening to port ... ${PORT}. Version: ${process.env.npm_package_version}`);
});
