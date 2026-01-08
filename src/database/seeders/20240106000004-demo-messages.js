'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get conversation IDs
    const conversations = await queryInterface.sequelize.query(
      `SELECT c.id, c.customer_phone, c.status, c.flow_type, cl.segment
       FROM conversations c
       JOIN clients cl ON c.client_id = cl.id
       WHERE c.customer_phone IN (
         '+5511912345678', '+5511923456789', '+5511934567890',
         '+5511945678901', '+5511956789012', '+5511967890123',
         '+5511978901234', '+5511989012345', '+5511990123456'
       )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (conversations.length === 0) {
      console.log('Conversations not found, skipping messages seeder');
      return;
    }

    const messages = [];
    const now = new Date();

    for (const conv of conversations) {
      const baseTime = new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000);

      if (conv.segment === 'delivery') {
        // Delivery conversation messages
        if (conv.customer_phone === '+5511912345678') {
          // Completed delivery order
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Oi, boa noite!', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Quero fazer um pedido', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Claro! Temos Hambúrgueres, Pizzas e Bebidas. O que você gostaria?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Uma pizza mussarela e um refrigerante 2L', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! 1x Pizza Mussarela (R$ 45,00) e 1x Refrigerante 2L (R$ 12,00). Total: R$ 57,00. Qual o endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Rua das Flores, 123 - Centro', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Ótimo! Como você prefere pagar? Aceitamos: PIX, Cartão ou Dinheiro.', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'PIX', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Pedido confirmado! 🎉\n\n📋 Resumo:\n- 1x Pizza Mussarela - R$ 45,00\n- 1x Refrigerante 2L - R$ 12,00\n\n💰 Total: R$ 57,00\n📍 Entrega: Rua das Flores, 123 - Centro\n💳 Pagamento: PIX\n\nObrigado pela preferência!', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000) }
          );
        } else if (conv.customer_phone === '+5511923456789') {
          // Completed delivery order - larger order
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Olá!', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Quero 2 hamburguer duplo, 1 bacon e 3 refri lata', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Entendido! 2x Hambúrguer Duplo (R$ 64,00), 1x Hambúrguer Bacon (R$ 35,00) e 3x Refrigerante Lata (R$ 18,00). Total: R$ 117,00. Qual o endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Av. Brasil, 456 - Jardim Europa', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! Como você prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Pedido confirmado! 🎉 Total: R$ 117,00. Entrega em Av. Brasil, 456. Obrigado!', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000) }
          );
        } else if (conv.customer_phone === '+5511934567890') {
          // Ongoing delivery order
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Quero uma pizza calabresa', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Ótimo! 1x Pizza Calabresa (R$ 48,00). Gostaria de adicionar mais alguma coisa?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) }
          );
        } else if (conv.customer_phone === '+5511945678901') {
          // Transferred conversation
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Preciso falar com um atendente', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Claro! Vou transferir você para um atendente humano. Por favor, aguarde um momento.', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) }
          );
        } else if (conv.customer_phone === '+5511956789012') {
          // Abandoned conversation
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Pizzaria do João. Como posso ajudar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Quero um hamburguer classico', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: '1x Hambúrguer Clássico (R$ 25,00). Qual o endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) }
          );
        }
      } else if (conv.segment === 'clothing') {
        // Clothing conversation messages
        if (conv.customer_phone === '+5511967890123') {
          // Completed clothing order - delivery
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Oi, tudo bem?', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja de Roupas da Maria. Que produto você está procurando?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Quero uma camiseta preta masculina', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Temos a Camiseta Básica Preta por R$ 45,00. Qual tamanho você usa? (P, M ou G)', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'M', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! Camiseta Básica Preta tamanho M - R$ 45,00. Você prefere retirar na loja ou entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Qual o endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Rua Augusta, 789 - Consolação', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'PIX', message_type: 'text', created_at: new Date(baseTime.getTime() + 300000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Pedido confirmado! 🎉\n\nCamiseta Básica Preta - M\nR$ 45,00\nEntrega: Rua Augusta, 789\nPagamento: PIX\n\nObrigado pela preferência!', message_type: 'text', created_at: new Date(baseTime.getTime() + 301000) }
          );
        } else if (conv.customer_phone === '+5511978901234') {
          // Completed clothing order - pickup
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde!', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja de Roupas da Maria. Que produto você está procurando?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Vocês tem vestido?', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Temos sim! Vestido Floral (R$ 120,00) e Vestido Preto Básico (R$ 95,00). Qual você prefere?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'O floral rosa', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Ótima escolha! Vestido Floral rosa - R$ 120,00. Qual tamanho? (P, M ou G)', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'P', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Você prefere retirar na loja ou entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Vou retirar na loja', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 300000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Reserva confirmada! 🎉\n\nVestido Floral rosa - P\nR$ 120,00\nRetirada na loja\nPagamento: Cartão\n\nObrigado pela preferência!', message_type: 'text', created_at: new Date(baseTime.getTime() + 301000) }
          );
        } else if (conv.customer_phone === '+5511989012345') {
          // Ongoing clothing conversation
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja de Roupas da Maria. Que produto você está procurando?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Calça jeans azul feminina', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Temos Calça Jeans Azul feminina por R$ 79,00. Qual tamanho você usa? (36, 38 ou 40)', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) }
          );
        } else if (conv.customer_phone === '+5511990123456') {
          // Transferred - size not available
          messages.push(
            { conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime()) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja de Roupas da Maria. Que produto você está procurando?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000) },
            { conversation_id: conv.id, direction: 'incoming', content: 'Vestido preto GG', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000) },
            { conversation_id: conv.id, direction: 'outgoing', content: 'Infelizmente o Vestido Preto Básico não está disponível no tamanho GG. Vou transferir você para um atendente verificar outras opções.', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000) }
          );
        }
      }
    }

    if (messages.length > 0) {
      await queryInterface.bulkInsert('messages', messages);
    }
  },

  async down(queryInterface, Sequelize) {
    // Get conversation IDs to delete messages
    const conversations = await queryInterface.sequelize.query(
      `SELECT id FROM conversations WHERE customer_phone IN (
        '+5511912345678', '+5511923456789', '+5511934567890',
        '+5511945678901', '+5511956789012', '+5511967890123',
        '+5511978901234', '+5511989012345', '+5511990123456'
      )`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);
      await queryInterface.bulkDelete('messages', {
        conversation_id: { [Sequelize.Op.in]: conversationIds }
      }, {});
    }
  }
};
