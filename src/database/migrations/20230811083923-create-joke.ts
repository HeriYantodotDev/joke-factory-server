import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('jokes', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.STRING,
      },
      timestamp: {
        type: Sequelize.BIGINT,
      },
      userID: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('jokes');
  }
}



