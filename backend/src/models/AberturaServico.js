import { Model, DataTypes } from 'sequelize';

class AberturaServico extends Model {
  static init(sequelize) {
    super.init({
      id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW  
      },
      veiculo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'veiculos',
          key: 'id'
        }
      },
      servico_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'servicos',
          key: 'id'
        }
      },
      funcionario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'funcionarios',
          key: 'id'
        }
      }
    }, { 
      sequelize, 
      modelName: 'AberturaServico', 
      tableName: 'abertura_servico' 
    });
  }

  static associate(models) {
    this.belongsTo(models.Veiculo, {
      foreignKey: 'veiculo_id',
      as: 'veiculo',
    });

    this.belongsTo(models.Servico, {
      foreignKey: 'servico_id',
      as: 'servico',
    });

    this.belongsTo(models.Funcionario, {
      foreignKey: 'funcionario_id',
      as: 'funcionario',
    });

    this.hasMany(models.AdicaoPeca, {
      foreignKey: 'abertura_servico_id',
      as: 'pecas'
    });

    // this.hasMany(models.ExecucaoServico, {
    //   foreignKey: 'ordem_servico_id',
    //   as: 'execucoesServico',
    // });
  }
}

export { AberturaServico };
