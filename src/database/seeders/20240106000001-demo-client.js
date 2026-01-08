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
          operatingHours: {
            monday: { open: '18:00', close: '23:00' },
            tuesday: { open: '18:00', close: '23:00' },
            wednesday: { open: '18:00', close: '23:00' },
            thursday: { open: '18:00', close: '23:00' },
            friday: { open: '18:00', close: '00:00' },
            saturday: { open: '18:00', close: '00:00' },
            sunday: { open: '18:00', close: '22:00' }
          },
          messages: {
            greeting: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?',
            confirmation: 'Posso confirmar o seu pedido?',
            farewell: 'Obrigado pela preferência!',
            fallback: 'Desculpe, não entendi. Pode repetir?'
          },
          costs: {
            fixedCosts: 5000,
            variableCostPercent: 35
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clients', { whatsapp_number: '+5511999999999' }, {});
  }
};
