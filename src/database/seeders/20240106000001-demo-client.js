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
      },
      {
        name: 'Hamburgueria Premium',
        segment: 'delivery',
        whatsapp_number: '+5511977777777',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Hambúrgueres Artesanais', items: [
              { name: 'Hambúrguer Artesanal Simples', price: 28 },
              { name: 'Hambúrguer Artesanal Duplo', price: 38 },
              { name: 'Hambúrguer Artesanal Triplo', price: 48 },
              { name: 'Hambúrguer Vegetariano', price: 32 }
            ]},
            { category: 'Acompanhamentos', items: [
              { name: 'Batata Frita Pequena', price: 12 },
              { name: 'Batata Frita Grande', price: 18 },
              { name: 'Onion Rings', price: 15 },
              { name: 'Nuggets (6 unid)', price: 16 }
            ]},
            { category: 'Bebidas', items: [
              { name: 'Refrigerante Lata', price: 5 },
              { name: 'Refrigerante 600ml', price: 8 },
              { name: 'Suco Natural', price: 10 },
              { name: 'Água Mineral', price: 4 }
            ]},
            { category: 'Sobremesas', items: [
              { name: 'Milk Shake Chocolate', price: 14 },
              { name: 'Milk Shake Morango', price: 14 },
              { name: 'Sorvete (2 bolas)', price: 10 }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          operatingHours: {
            monday: { open: '17:00', close: '23:00' },
            tuesday: { open: '17:00', close: '23:00' },
            wednesday: { open: '17:00', close: '23:00' },
            thursday: { open: '17:00', close: '23:00' },
            friday: { open: '17:00', close: '01:00' },
            saturday: { open: '17:00', close: '01:00' },
            sunday: { open: '17:00', close: '23:00' }
          },
          messages: {
            greeting: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!',
            confirmation: 'Posso confirmar seu pedido?',
            farewell: 'Muito obrigado! Seu hambúrguer está a caminho! 🚗',
            fallback: 'Desculpe, não entendi. Pode reformular sua mensagem?'
          },
          costs: {
            fixedCosts: 7000,
            variableCostPercent: 38
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Açaí do Bairro',
        segment: 'delivery',
        whatsapp_number: '+5511966666666',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Açaí', items: [
              { name: 'Açaí 300ml', price: 12 },
              { name: 'Açaí 500ml', price: 18 },
              { name: 'Açaí 700ml', price: 24 },
              { name: 'Açaí 1L', price: 32 }
            ]},
            { category: 'Complementos', items: [
              { name: 'Banana', price: 2 },
              { name: 'Morango', price: 3 },
              { name: 'Granola', price: 2 },
              { name: 'Leite em Pó', price: 2 },
              { name: 'Paçoca', price: 3 },
              { name: 'Confete', price: 2 }
            ]},
            { category: 'Sucos', items: [
              { name: 'Suco de Laranja 300ml', price: 8 },
              { name: 'Suco de Morango 300ml', price: 10 },
              { name: 'Suco de Abacaxi 300ml', price: 8 }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          operatingHours: {
            monday: { open: '10:00', close: '20:00' },
            tuesday: { open: '10:00', close: '20:00' },
            wednesday: { open: '10:00', close: '20:00' },
            thursday: { open: '10:00', close: '20:00' },
            friday: { open: '10:00', close: '21:00' },
            saturday: { open: '10:00', close: '21:00' },
            sunday: { open: '10:00', close: '20:00' }
          },
          messages: {
            greeting: 'Olá! Bem-vindo ao Açaí do Bairro! 🍇 Qual o tamanho do seu açaí hoje?',
            confirmation: 'Confirma o pedido?',
            farewell: 'Obrigado! Açaí fresquinho a caminho! 😋',
            fallback: 'Não entendi. Pode repetir o que deseja?'
          },
          costs: {
            fixedCosts: 3000,
            variableCostPercent: 30
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Lanchonete Central',
        segment: 'delivery',
        whatsapp_number: '+5511955555555',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Sanduíches', items: [
              { name: 'Misto Quente', price: 8 },
              { name: 'Bauru', price: 12 },
              { name: 'X-Salada', price: 15 },
              { name: 'X-Bacon', price: 18 },
              { name: 'X-Tudo', price: 22 }
            ]},
            { category: 'Salgados', items: [
              { name: 'Coxinha', price: 6 },
              { name: 'Kibe', price: 6 },
              { name: 'Pastel de Carne', price: 7 },
              { name: 'Pastel de Queijo', price: 7 },
              { name: 'Empadão', price: 8 }
            ]},
            { category: 'Bebidas', items: [
              { name: 'Café', price: 3 },
              { name: 'Suco Lata', price: 5 },
              { name: 'Refrigerante Lata', price: 5 },
              { name: 'Água', price: 3 }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          operatingHours: {
            monday: { open: '06:00', close: '20:00' },
            tuesday: { open: '06:00', close: '20:00' },
            wednesday: { open: '06:00', close: '20:00' },
            thursday: { open: '06:00', close: '20:00' },
            friday: { open: '06:00', close: '20:00' },
            saturday: { open: '07:00', close: '15:00' },
            sunday: { open: 'closed', close: 'closed' }
          },
          messages: {
            greeting: 'Bom dia! Lanchonete Central aqui. O que vai querer hoje?',
            confirmation: 'Tá certo esse pedido?',
            farewell: 'Valeu! Logo, logo seu lanche chega!',
            fallback: 'Não entendi direito. Pode falar de novo?'
          },
          costs: {
            fixedCosts: 4500,
            variableCostPercent: 32
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('clients', {
      whatsapp_number: {
        [Sequelize.Op.in]: ['+5511999999999', '+5511977777777', '+5511966666666', '+5511955555555']
      }
    }, {});
  }
};
