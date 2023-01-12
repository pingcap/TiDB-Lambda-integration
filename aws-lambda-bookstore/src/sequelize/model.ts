import { Sequelize, DataTypes, Model } from "sequelize";

class Book extends Model {}

export function getBookModel(sequelize: Sequelize) {
  Book.init(
    {
      // Model attributes are defined here
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      publishAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "publish_at",
      },
      stock: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      authors: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      // Other model options go here
      sequelize, // We need to pass the connection instance
      modelName: "book", // We need to choose the model name
      engine: "MYISAM",
    }
  );
  return Book;
}
