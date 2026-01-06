'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('clients', [
      {
        name: 'Pizzaria do João',
        segment: 'delivery',
        whatsapp_number: '+5511999999999',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Hambúrgueres', items: [
              { name: 'Hambúrguer Clássico', price: 25 },
              { name: 'Hambúrguer Duplo', price: 32 },
              { name: 'Hambúrguer Bacon', price: 35 }
            ]},
            { category: 'Pizzas', items: [
              { name: 'Pizza Mussarela', price: 45 },
              { name: 'Pizza Calabresa', price: 48 }
            ]},
            { category: 'Bebidas', items: [
              { name: 'Refrigerante Lata', price: 6 },
              { name: 'Refrigerante 2L', price: 12 },
              { name: 'Água', price: 4 }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          messages: {
            greeting: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?',
            confirmation: 'Posso confirmar o seu pedido?',
            farewell: 'Obrigado pela preferência!'
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clients', null, {});
  }
};
