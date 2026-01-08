'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get client IDs
    const clients = await queryInterface.sequelize.query(
      `SELECT id, segment FROM clients WHERE whatsapp_number IN ('+5511999999999', '+5511988888888')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const deliveryClient = clients.find(c => c.segment === 'delivery');
    const clothingClient = clients.find(c => c.segment === 'clothing');

    if (!deliveryClient || !clothingClient) {
      console.log('Clients not found, skipping conversations seeder');
      return;
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    await queryInterface.bulkInsert('conversations', [
      // Delivery client conversations
      {
        client_id: deliveryClient.id,
        customer_phone: '+5511912345678',
        status: 'completed',
        transfer_reason: null,
        current_state: 'completed',
        collected_data: JSON.stringify({
          items: [
            { name: 'Pizza Mussarela', price: 45, quantity: 1 },
            { name: 'Refrigerante 2L', price: 12, quantity: 1 }
          ],
          address: 'Rua das Flores, 123 - Centro',
          paymentMethod: 'pix'
        }),
        flow_type: 'delivery',
        started_at: twoDaysAgo,
        last_message_at: twoDaysAgo,
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo
      },
      {
        client_id: deliveryClient.id,
        customer_phone: '+5511923456789',
        status: 'completed',
        transfer_reason: null,
        current_state: 'completed',
        collected_data: JSON.stringify({
          items: [
            { name: 'Hambúrguer Duplo', price: 32, quantity: 2 },
            { name: 'Hambúrguer Bacon', price: 35, quantity: 1 },
            { name: 'Refrigerante Lata', price: 6, quantity: 3 }
          ],
          address: 'Av. Brasil, 456 - Jardim Europa',
          paymentMethod: 'card'
        }),
        flow_type: 'delivery',
        started_at: oneDayAgo,
        last_message_at: oneDayAgo,
        created_at: oneDayAgo,
        updated_at: oneDayAgo
      },
      {
        client_id: deliveryClient.id,
        customer_phone: '+5511934567890',
        status: 'ongoing',
        transfer_reason: null,
        current_state: 'collecting_items',
        collected_data: JSON.stringify({
          items: [
            { name: 'Pizza Calabresa', price: 48, quantity: 1 }
          ]
        }),
        flow_type: 'delivery',
        started_at: oneHourAgo,
        last_message_at: now,
        created_at: oneHourAgo,
        updated_at: now
      },
      {
        client_id: deliveryClient.id,
        customer_phone: '+5511945678901',
        status: 'transferred',
        transfer_reason: 'Cliente solicitou falar com atendente humano',
        current_state: 'transferred',
        collected_data: JSON.stringify({}),
        flow_type: 'delivery',
        started_at: twoHoursAgo,
        last_message_at: twoHoursAgo,
        created_at: twoHoursAgo,
        updated_at: twoHoursAgo
      },
      {
        client_id: deliveryClient.id,
        customer_phone: '+5511956789012',
        status: 'abandoned',
        transfer_reason: null,
        current_state: 'collecting_address',
        collected_data: JSON.stringify({
          items: [
            { name: 'Hambúrguer Clássico', price: 25, quantity: 1 }
          ]
        }),
        flow_type: 'delivery',
        started_at: threeDaysAgo,
        last_message_at: threeDaysAgo,
        created_at: threeDaysAgo,
        updated_at: threeDaysAgo
      },

      // Clothing client conversations
      {
        client_id: clothingClient.id,
        customer_phone: '+5511967890123',
        status: 'completed',
        transfer_reason: null,
        current_state: 'completed',
        collected_data: JSON.stringify({
          product: {
            name: 'Camiseta Básica Preta',
            size: 'M',
            color: 'preta',
            price: 45,
            gender: 'masculino'
          },
          deliveryType: 'delivery',
          address: 'Rua Augusta, 789 - Consolação',
          paymentMethod: 'pix'
        }),
        flow_type: 'clothing',
        started_at: oneDayAgo,
        last_message_at: oneDayAgo,
        created_at: oneDayAgo,
        updated_at: oneDayAgo
      },
      {
        client_id: clothingClient.id,
        customer_phone: '+5511978901234',
        status: 'completed',
        transfer_reason: null,
        current_state: 'completed',
        collected_data: JSON.stringify({
          product: {
            name: 'Vestido Floral',
            size: 'P',
            color: 'rosa',
            price: 120,
            gender: 'feminino'
          },
          deliveryType: 'pickup',
          paymentMethod: 'card'
        }),
        flow_type: 'clothing',
        started_at: twoDaysAgo,
        last_message_at: twoDaysAgo,
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo
      },
      {
        client_id: clothingClient.id,
        customer_phone: '+5511989012345',
        status: 'ongoing',
        transfer_reason: null,
        current_state: 'selecting_size',
        collected_data: JSON.stringify({
          product: {
            name: 'Calça Jeans Azul',
            color: 'azul',
            gender: 'feminino'
          },
          availableOptions: [
            { name: 'Calça Jeans Azul - 36', price: 79 },
            { name: 'Calça Jeans Azul - 38', price: 79 },
            { name: 'Calça Jeans Azul - 40', price: 79 }
          ]
        }),
        flow_type: 'clothing',
        started_at: twoHoursAgo,
        last_message_at: now,
        created_at: twoHoursAgo,
        updated_at: now
      },
      {
        client_id: clothingClient.id,
        customer_phone: '+5511990123456',
        status: 'transferred',
        transfer_reason: 'Produto não disponível no tamanho solicitado',
        current_state: 'transferred',
        collected_data: JSON.stringify({
          product: {
            name: 'Vestido Preto Básico',
            size: 'GG',
            color: 'preta',
            gender: 'feminino'
          }
        }),
        flow_type: 'clothing',
        started_at: threeDaysAgo,
        last_message_at: threeDaysAgo,
        created_at: threeDaysAgo,
        updated_at: threeDaysAgo
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('conversations', {
      customer_phone: {
        [Sequelize.Op.in]: [
          '+5511912345678', '+5511923456789', '+5511934567890',
          '+5511945678901', '+5511956789012', '+5511967890123',
          '+5511978901234', '+5511989012345', '+5511990123456'
        ]
      }
    }, {});
  }
};
