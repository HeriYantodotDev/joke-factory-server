import { QueryInterface, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import { UserTypesArray } from '../../models';

async function hashPassword(plainTextPass: string): Promise<string> {
  const saltRounds = 10;
  const hash = await bcrypt.hash(plainTextPass, saltRounds);
  return hash;
}
async function addMultipleNewUsersArray(activeUserAccount: number, inactiveUserAccount = 0): Promise<UserTypesArray[]> {
  const userList: UserTypesArray[] = [];                                              
  const password = await hashPassword('A4GuaN@SmZ');
  for (let i=0; i < (activeUserAccount+inactiveUserAccount); i++) {
    const newUser: UserTypesArray = {
      username: `user${i+1}`,
      email: `user${i+1}@gmail.com`,
      password,
      inactive: i >= activeUserAccount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    userList.push(newUser);
  }
  return userList;
}

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    const newUserArray = await addMultipleNewUsersArray(25);
    await queryInterface.bulkInsert('users', newUserArray, {});
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.bulkDelete('users', {}, {})
  }
}

// NOTE: 
// For somehow when I tried running User Model Helper function 
// without specifying the environment variable, it breaks. 
// For ease I duplicate the function. I can refactor it later. 
