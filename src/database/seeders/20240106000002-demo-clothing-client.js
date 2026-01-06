'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('clients', [
      {
        name: 'Loja de Roupas da Maria',
        segment: 'clothing',
        whatsapp_number: '+5511988888888',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Camisetas', items: [
              { name: 'Camiseta Básica Preta', price: 45, size: 'P', color: 'preta', gender: 'masculino' },
              { name: 'Camiseta Básica Preta', price: 45, size: 'M', color: 'preta', gender: 'masculino' },
              { name: 'Camiseta Básica Preta', price: 45, size: 'G', color: 'preta', gender: 'masculino' },
              { name: 'Camiseta Básica Branca', price: 45, size: 'P', color: 'branca', gender: 'masculino' },
              { name: 'Camiseta Básica Branca', price: 45, size: 'M', color: 'branca', gender: 'masculino' },
              { name: 'Camiseta Básica Branca', price: 45, size: 'G', color: 'branca', gender: 'masculino' },
              { name: 'Camiseta Básica Preta', price: 42, size: 'P', color: 'preta', gender: 'feminino' },
              { name: 'Camiseta Básica Preta', price: 42, size: 'M', color: 'preta', gender: 'feminino' },
              { name: 'Camiseta Básica Preta', price: 42, size: 'G', color: 'preta', gender: 'feminino' },
              { name: 'Camiseta Básica Branca', price: 42, size: 'P', color: 'branca', gender: 'feminino' },
              { name: 'Camiseta Básica Branca', price: 42, size: 'M', color: 'branca', gender: 'feminino' },
              { name: 'Camiseta Básica Branca', price: 42, size: 'G', color: 'branca', gender: 'feminino' }
            ]},
            { category: 'Calças', items: [
              { name: 'Calça Jeans Azul', price: 89, size: '38', color: 'azul', gender: 'masculino' },
              { name: 'Calça Jeans Azul', price: 89, size: '40', color: 'azul', gender: 'masculino' },
              { name: 'Calça Jeans Azul', price: 89, size: '42', color: 'azul', gender: 'masculino' },
              { name: 'Calça Jeans Preta', price: 89, size: '38', color: 'preta', gender: 'masculino' },
              { name: 'Calça Jeans Preta', price: 89, size: '40', color: 'preta', gender: 'masculino' },
              { name: 'Calça Jeans Preta', price: 89, size: '42', color: 'preta', gender: 'masculino' },
              { name: 'Calça Jeans Azul', price: 79, size: '36', color: 'azul', gender: 'feminino' },
              { name: 'Calça Jeans Azul', price: 79, size: '38', color: 'azul', gender: 'feminino' },
              { name: 'Calça Jeans Azul', price: 79, size: '40', color: 'azul', gender: 'feminino' },
              { name: 'Calça Jeans Preta', price: 79, size: '36', color: 'preta', gender: 'feminino' },
              { name: 'Calça Jeans Preta', price: 79, size: '38', color: 'preta', gender: 'feminino' },
              { name: 'Calça Jeans Preta', price: 79, size: '40', color: 'preta', gender: 'feminino' }
            ]},
            { category: 'Vestidos', items: [
              { name: 'Vestido Floral', price: 120, size: 'P', color: 'rosa', gender: 'feminino' },
              { name: 'Vestido Floral', price: 120, size: 'M', color: 'rosa', gender: 'feminino' },
              { name: 'Vestido Floral', price: 120, size: 'G', color: 'rosa', gender: 'feminino' },
              { name: 'Vestido Preto Básico', price: 95, size: 'P', color: 'preta', gender: 'feminino' },
              { name: 'Vestido Preto Básico', price: 95, size: 'M', color: 'preta', gender: 'feminino' },
              { name: 'Vestido Preto Básico', price: 95, size: 'G', color: 'preta', gender: 'feminino' }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          messages: {
            greeting: 'Olá! Bem-vindo à Loja de Roupas da Maria. Que produto você está procurando?',
            confirmation: 'Posso reservar e confirmar?',
            farewell: 'Obrigado pela preferência!'
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clients', { segment: 'clothing' }, {});
  }
};
