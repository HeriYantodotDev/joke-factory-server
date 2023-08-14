import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('attachments', {
      id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      filename: {
        type: Sequelize.STRING,
      },
      fileType: {
        type: Sequelize.STRING,
      },
      jokeID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'jokes',
          key: 'id'
        },
        onDelete: 'cascade'
      },
      uploadDate: {
        type: Sequelize.DATE,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.dropTable('attachments');
  }
}



