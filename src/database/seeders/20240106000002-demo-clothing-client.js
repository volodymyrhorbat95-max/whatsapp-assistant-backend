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
          operatingHours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '14:00' },
            sunday: { open: 'closed', close: 'closed' }
          },
          messages: {
            greeting: 'Olá! Bem-vindo à Loja de Roupas da Maria. Que produto você está procurando?',
            confirmation: 'Posso reservar e confirmar?',
            farewell: 'Obrigado pela preferência!',
            fallback: 'Desculpe, não entendi. Pode me dizer o tipo de roupa que procura?'
          },
          costs: {
            fixedCosts: 3500,
            variableCostPercent: 45
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Boutique Elegância',
        segment: 'clothing',
        whatsapp_number: '+5511944444444',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Vestidos', items: [
              { name: 'Vestido Longo Festa', price: 250, size: 'P', color: 'azul', gender: 'feminino' },
              { name: 'Vestido Longo Festa', price: 250, size: 'M', color: 'azul', gender: 'feminino' },
              { name: 'Vestido Longo Festa', price: 250, size: 'G', color: 'azul', gender: 'feminino' },
              { name: 'Vestido Midi Florido', price: 180, size: 'P', color: 'verde', gender: 'feminino' },
              { name: 'Vestido Midi Florido', price: 180, size: 'M', color: 'verde', gender: 'feminino' },
              { name: 'Vestido Midi Florido', price: 180, size: 'G', color: 'verde', gender: 'feminino' },
              { name: 'Vestido Curto Social', price: 150, size: 'P', color: 'preto', gender: 'feminino' },
              { name: 'Vestido Curto Social', price: 150, size: 'M', color: 'preto', gender: 'feminino' }
            ]},
            { category: 'Blusas', items: [
              { name: 'Blusa Social Branca', price: 85, size: 'P', color: 'branca', gender: 'feminino' },
              { name: 'Blusa Social Branca', price: 85, size: 'M', color: 'branca', gender: 'feminino' },
              { name: 'Blusa Social Branca', price: 85, size: 'G', color: 'branca', gender: 'feminino' },
              { name: 'Blusa Estampada', price: 75, size: 'P', color: 'colorida', gender: 'feminino' },
              { name: 'Blusa Estampada', price: 75, size: 'M', color: 'colorida', gender: 'feminino' },
              { name: 'Blusa Estampada', price: 75, size: 'G', color: 'colorida', gender: 'feminino' }
            ]},
            { category: 'Saias', items: [
              { name: 'Saia Midi Jeans', price: 95, size: 'P', color: 'azul', gender: 'feminino' },
              { name: 'Saia Midi Jeans', price: 95, size: 'M', color: 'azul', gender: 'feminino' },
              { name: 'Saia Midi Jeans', price: 95, size: 'G', color: 'azul', gender: 'feminino' },
              { name: 'Saia Curta Preta', price: 70, size: 'P', color: 'preta', gender: 'feminino' },
              { name: 'Saia Curta Preta', price: 70, size: 'M', color: 'preta', gender: 'feminino' }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          operatingHours: {
            monday: { open: '10:00', close: '19:00' },
            tuesday: { open: '10:00', close: '19:00' },
            wednesday: { open: '10:00', close: '19:00' },
            thursday: { open: '10:00', close: '19:00' },
            friday: { open: '10:00', close: '20:00' },
            saturday: { open: '10:00', close: '18:00' },
            sunday: { open: 'closed', close: 'closed' }
          },
          messages: {
            greeting: 'Bem-vinda à Boutique Elegância! ✨ Como posso ajudá-la hoje?',
            confirmation: 'Confirma essa escolha maravilhosa?',
            farewell: 'Obrigada pela preferência! Você vai ficar linda! 💕',
            fallback: 'Não entendi bem. Pode me dizer que tipo de peça procura?'
          },
          costs: {
            fixedCosts: 6000,
            variableCostPercent: 50
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Loja Masculina Top',
        segment: 'clothing',
        whatsapp_number: '+5511933333333',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Camisas Sociais', items: [
              { name: 'Camisa Social Branca', price: 110, size: 'P', color: 'branca', gender: 'masculino' },
              { name: 'Camisa Social Branca', price: 110, size: 'M', color: 'branca', gender: 'masculino' },
              { name: 'Camisa Social Branca', price: 110, size: 'G', color: 'branca', gender: 'masculino' },
              { name: 'Camisa Social Branca', price: 110, size: 'GG', color: 'branca', gender: 'masculino' },
              { name: 'Camisa Social Azul', price: 110, size: 'P', color: 'azul', gender: 'masculino' },
              { name: 'Camisa Social Azul', price: 110, size: 'M', color: 'azul', gender: 'masculino' },
              { name: 'Camisa Social Azul', price: 110, size: 'G', color: 'azul', gender: 'masculino' },
              { name: 'Camisa Social Preta', price: 115, size: 'M', color: 'preta', gender: 'masculino' },
              { name: 'Camisa Social Preta', price: 115, size: 'G', color: 'preta', gender: 'masculino' }
            ]},
            { category: 'Calças Sociais', items: [
              { name: 'Calça Social Preta', price: 130, size: '38', color: 'preta', gender: 'masculino' },
              { name: 'Calça Social Preta', price: 130, size: '40', color: 'preta', gender: 'masculino' },
              { name: 'Calça Social Preta', price: 130, size: '42', color: 'preta', gender: 'masculino' },
              { name: 'Calça Social Preta', price: 130, size: '44', color: 'preta', gender: 'masculino' },
              { name: 'Calça Social Cinza', price: 130, size: '38', color: 'cinza', gender: 'masculino' },
              { name: 'Calça Social Cinza', price: 130, size: '40', color: 'cinza', gender: 'masculino' },
              { name: 'Calça Social Cinza', price: 130, size: '42', color: 'cinza', gender: 'masculino' }
            ]},
            { category: 'Polos', items: [
              { name: 'Polo Básica Preta', price: 65, size: 'P', color: 'preta', gender: 'masculino' },
              { name: 'Polo Básica Preta', price: 65, size: 'M', color: 'preta', gender: 'masculino' },
              { name: 'Polo Básica Preta', price: 65, size: 'G', color: 'preta', gender: 'masculino' },
              { name: 'Polo Básica Branca', price: 65, size: 'P', color: 'branca', gender: 'masculino' },
              { name: 'Polo Básica Branca', price: 65, size: 'M', color: 'branca', gender: 'masculino' },
              { name: 'Polo Básica Branca', price: 65, size: 'G', color: 'branca', gender: 'masculino' }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          operatingHours: {
            monday: { open: '09:00', close: '19:00' },
            tuesday: { open: '09:00', close: '19:00' },
            wednesday: { open: '09:00', close: '19:00' },
            thursday: { open: '09:00', close: '19:00' },
            friday: { open: '09:00', close: '20:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: '10:00', close: '14:00' }
          },
          messages: {
            greeting: 'Olá! Bem-vindo à Loja Masculina Top. Procurando algo específico?',
            confirmation: 'Confirma seu pedido?',
            farewell: 'Obrigado! Vai arrasar com essa peça!',
            fallback: 'Desculpe, não entendi. Que tipo de roupa masculina procura?'
          },
          costs: {
            fixedCosts: 5500,
            variableCostPercent: 48
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Kids Fashion Store',
        segment: 'clothing',
        whatsapp_number: '+5511922222222',
        status: 'active',
        configuration: JSON.stringify({
          catalog: [
            { category: 'Conjuntos Infantis', items: [
              { name: 'Conjunto Moletom Azul', price: 85, size: '2', color: 'azul', gender: 'masculino' },
              { name: 'Conjunto Moletom Azul', price: 85, size: '4', color: 'azul', gender: 'masculino' },
              { name: 'Conjunto Moletom Azul', price: 85, size: '6', color: 'azul', gender: 'masculino' },
              { name: 'Conjunto Moletom Rosa', price: 85, size: '2', color: 'rosa', gender: 'feminino' },
              { name: 'Conjunto Moletom Rosa', price: 85, size: '4', color: 'rosa', gender: 'feminino' },
              { name: 'Conjunto Moletom Rosa', price: 85, size: '6', color: 'rosa', gender: 'feminino' }
            ]},
            { category: 'Camisetas Infantis', items: [
              { name: 'Camiseta Estampada Menino', price: 35, size: '2', color: 'verde', gender: 'masculino' },
              { name: 'Camiseta Estampada Menino', price: 35, size: '4', color: 'verde', gender: 'masculino' },
              { name: 'Camiseta Estampada Menino', price: 35, size: '6', color: 'verde', gender: 'masculino' },
              { name: 'Camiseta Estampada Menino', price: 35, size: '8', color: 'verde', gender: 'masculino' },
              { name: 'Camiseta Estampada Menina', price: 35, size: '2', color: 'rosa', gender: 'feminino' },
              { name: 'Camiseta Estampada Menina', price: 35, size: '4', color: 'rosa', gender: 'feminino' },
              { name: 'Camiseta Estampada Menina', price: 35, size: '6', color: 'rosa', gender: 'feminino' }
            ]},
            { category: 'Vestidos Infantis', items: [
              { name: 'Vestido Princesa', price: 90, size: '2', color: 'rosa', gender: 'feminino' },
              { name: 'Vestido Princesa', price: 90, size: '4', color: 'rosa', gender: 'feminino' },
              { name: 'Vestido Princesa', price: 90, size: '6', color: 'rosa', gender: 'feminino' },
              { name: 'Vestido Jeans Infantil', price: 75, size: '4', color: 'azul', gender: 'feminino' },
              { name: 'Vestido Jeans Infantil', price: 75, size: '6', color: 'azul', gender: 'feminino' },
              { name: 'Vestido Jeans Infantil', price: 75, size: '8', color: 'azul', gender: 'feminino' }
            ]}
          ],
          paymentMethods: ['pix', 'card', 'cash'],
          operatingHours: {
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '19:00' },
            saturday: { open: '09:00', close: '17:00' },
            sunday: { open: 'closed', close: 'closed' }
          },
          messages: {
            greeting: 'Olá! Bem-vindo à Kids Fashion Store! 👶 Procurando roupinha para qual idade?',
            confirmation: 'Confirma a compra da roupinha?',
            farewell: 'Obrigada! Seu pequeno vai ficar lindo! 💙',
            fallback: 'Desculpe, não entendi. Pode me dizer o que procura para seu filho(a)?'
          },
          costs: {
            fixedCosts: 4000,
            variableCostPercent: 42
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
        [Sequelize.Op.in]: ['+5511988888888', '+5511944444444', '+5511933333333', '+5511922222222']
      }
    }, {});
  }
};
