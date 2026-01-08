'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get completed conversations with their client IDs
    const conversations = await queryInterface.sequelize.query(
      `SELECT c.id, c.customer_phone, c.client_id, c.collected_data, cl.segment
       FROM conversations c
       JOIN clients cl ON c.client_id = cl.id
       WHERE c.status = 'completed'
       AND c.customer_phone IN (
         '+5511912345678', '+5511923456789',
         '+5511967890123', '+5511978901234'
       )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (conversations.length === 0) {
      console.log('Completed conversations not found, skipping orders seeder');
      return;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const orders = [];

    for (const conv of conversations) {
      const collectedData = typeof conv.collected_data === 'string'
        ? JSON.parse(conv.collected_data)
        : conv.collected_data;

      if (conv.segment === 'delivery') {
        // Delivery orders
        if (conv.customer_phone === '+5511912345678') {
          orders.push({
            conversation_id: conv.id,
            client_id: conv.client_id,
            status: 'delivered',
            items: JSON.stringify([
              { name: 'Pizza Mussarela', price: 45, quantity: 1 },
              { name: 'Refrigerante 2L', price: 12, quantity: 1 }
            ]),
            total_amount: 57.00,
            delivery_address: 'Rua das Flores, 123 - Centro',
            payment_method: 'pix',
            created_at: twoDaysAgo,
            updated_at: twoDaysAgo
          });
        } else if (conv.customer_phone === '+5511923456789') {
          orders.push({
            conversation_id: conv.id,
            client_id: conv.client_id,
            status: 'out_for_delivery',
            items: JSON.stringify([
              { name: 'Hambúrguer Duplo', price: 32, quantity: 2 },
              { name: 'Hambúrguer Bacon', price: 35, quantity: 1 },
              { name: 'Refrigerante Lata', price: 6, quantity: 3 }
            ]),
            total_amount: 117.00,
            delivery_address: 'Av. Brasil, 456 - Jardim Europa',
            payment_method: 'card',
            created_at: oneDayAgo,
            updated_at: now
          });
        }
      } else if (conv.segment === 'clothing') {
        // Clothing orders
        if (conv.customer_phone === '+5511967890123') {
          orders.push({
            conversation_id: conv.id,
            client_id: conv.client_id,
            status: 'preparing',
            items: JSON.stringify([
              { name: 'Camiseta Básica Preta - M', price: 45, quantity: 1 }
            ]),
            total_amount: 45.00,
            delivery_address: 'Rua Augusta, 789 - Consolação',
            payment_method: 'pix',
            created_at: oneDayAgo,
            updated_at: now
          });
        } else if (conv.customer_phone === '+5511978901234') {
          orders.push({
            conversation_id: conv.id,
            client_id: conv.client_id,
            status: 'confirmed',
            items: JSON.stringify([
              { name: 'Vestido Floral rosa - P', price: 120, quantity: 1 }
            ]),
            total_amount: 120.00,
            delivery_address: null, // Pickup
            payment_method: 'card',
            created_at: twoDaysAgo,
            updated_at: twoDaysAgo
          });
        }
      }
    }

    if (orders.length > 0) {
      await queryInterface.bulkInsert('orders', orders);
    }
  },

  async down(queryInterface, Sequelize) {
    // Get conversation IDs to delete orders
    const conversations = await queryInterface.sequelize.query(
      `SELECT id FROM conversations WHERE customer_phone IN (
        '+5511912345678', '+5511923456789',
        '+5511967890123', '+5511978901234'
      )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);
      await queryInterface.bulkDelete('orders', {
        conversation_id: { [Sequelize.Op.in]: conversationIds }
      }, {});
    }
  }
};
