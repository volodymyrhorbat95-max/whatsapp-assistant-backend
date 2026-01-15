'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const clients = await queryInterface.sequelize.query(
      `SELECT id, segment, whatsapp_number FROM clients`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const hamburgueriaClient = clients.find(c => c.whatsapp_number === '+5511977777777');
    const acaiClient = clients.find(c => c.whatsapp_number === '+5511966666666');
    const lanchoneteClient = clients.find(c => c.whatsapp_number === '+5511955555555');
    const boutiqueClient = clients.find(c => c.whatsapp_number === '+5511944444444');
    const masculinaClient = clients.find(c => c.whatsapp_number === '+5511933333333');
    const kidsClient = clients.find(c => c.whatsapp_number === '+5511922222222');

    if (!hamburgueriaClient || !acaiClient || !lanchoneteClient || !boutiqueClient || !masculinaClient || !kidsClient) {
      console.log('New clients not found, skipping extended test data seeder');
      return;
    }

    const now = new Date();

    // Helper function to create timestamps with realistic peak hours distribution
    const createTimestamp = (daysAgo, hour, minute = 0) => {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(hour, minute, 0, 0);
      return date;
    };

    // Realistic timestamps distributed across different hours
    // Peak hours: Lunch (12-14h) and Dinner (19-21h)
    const timestamps = {
      // Hamburgueria (17h-23h operating hours) - dinner peak
      hamb1: createTimestamp(2, 19, 15),  // Dinner peak
      hamb2: createTimestamp(1, 20, 30),  // Dinner peak
      hamb3: createTimestamp(3, 18, 45),  // Early dinner
      hamb4: createTimestamp(0, 21, 10),  // Ongoing
      hamb5: createTimestamp(4, 17, 20),  // Opening hour - abandoned
      hamb6: createTimestamp(5, 19, 0),   // Dinner - transferred

      // Açaí (10h-20h operating hours) - afternoon peak
      acai1: createTimestamp(1, 15, 30),  // Afternoon
      acai2: createTimestamp(2, 14, 15),  // Early afternoon
      acai3: createTimestamp(3, 16, 45),  // Afternoon peak
      acai4: createTimestamp(0, 17, 20),  // Ongoing

      // Lanchonete (06h-20h operating hours) - lunch peak
      lanch1: createTimestamp(1, 12, 30), // Lunch peak
      lanch2: createTimestamp(2, 13, 15), // Lunch peak
      lanch3: createTimestamp(3, 11, 45), // Pre-lunch

      // Boutique (10h-20h operating hours)
      bout1: createTimestamp(1, 14, 20),
      bout2: createTimestamp(2, 16, 30),
      bout3: createTimestamp(3, 11, 15),
      bout4: createTimestamp(0, 18, 40),  // Ongoing

      // Masculina (09h-19h operating hours)
      masc1: createTimestamp(1, 13, 45),
      masc2: createTimestamp(2, 15, 20),
      masc3: createTimestamp(3, 10, 30),

      // Kids (10h-20h operating hours)
      kids1: createTimestamp(1, 16, 10),
      kids2: createTimestamp(2, 14, 50),
      kids3: createTimestamp(3, 12, 25)
    };

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const conversations = [];

    conversations.push(
      {client_id: hamburgueriaClient.id, customer_phone: '+5511800000001', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Hambúrguer Artesanal Duplo', price: 38, quantity: 1}, {name: 'Batata Frita Grande', price: 18, quantity: 1}, {name: 'Refrigerante 600ml', price: 8, quantity: 1}], address: 'Rua Paulista, 500 - Bela Vista', paymentMethod: 'pix'}), flow_type: 'delivery', started_at: timestamps.hamb1, last_message_at: timestamps.hamb1, created_at: timestamps.hamb1, updated_at: timestamps.hamb1},
      {client_id: hamburgueriaClient.id, customer_phone: '+5511800000002', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Hambúrguer Artesanal Triplo', price: 48, quantity: 2}, {name: 'Onion Rings', price: 15, quantity: 2}, {name: 'Milk Shake Chocolate', price: 14, quantity: 2}], address: 'Av. Liberdade, 789 - Liberdade', paymentMethod: 'card'}), flow_type: 'delivery', started_at: timestamps.hamb2, last_message_at: timestamps.hamb2, created_at: timestamps.hamb2, updated_at: timestamps.hamb2},
      {client_id: hamburgueriaClient.id, customer_phone: '+5511800000003', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Hambúrguer Vegetariano', price: 32, quantity: 1}, {name: 'Batata Frita Pequena', price: 12, quantity: 1}, {name: 'Suco Natural', price: 10, quantity: 1}], address: 'Rua Oscar Freire, 234 - Jardins', paymentMethod: 'pix'}), flow_type: 'delivery', started_at: timestamps.hamb3, last_message_at: timestamps.hamb3, created_at: timestamps.hamb3, updated_at: timestamps.hamb3},
      {client_id: hamburgueriaClient.id, customer_phone: '+5511800000004', status: 'ongoing', transfer_reason: null, current_state: 'collecting_address', collected_data: JSON.stringify({items: [{name: 'Hambúrguer Artesanal Simples', price: 28, quantity: 1}, {name: 'Água Mineral', price: 4, quantity: 1}]}), flow_type: 'delivery', started_at: timestamps.hamb4, last_message_at: oneHourAgo, created_at: timestamps.hamb4, updated_at: oneHourAgo},
      {client_id: hamburgueriaClient.id, customer_phone: '+5511800000005', status: 'abandoned', transfer_reason: null, current_state: 'collecting_items', collected_data: JSON.stringify({}), flow_type: 'delivery', started_at: timestamps.hamb5, last_message_at: timestamps.hamb5, created_at: timestamps.hamb5, updated_at: timestamps.hamb5},
      {client_id: hamburgueriaClient.id, customer_phone: '+5511800000006', status: 'transferred', transfer_reason: 'Cliente solicitou reclamação sobre pedido anterior', current_state: 'transferred', collected_data: JSON.stringify({}), flow_type: 'delivery', started_at: timestamps.hamb6, last_message_at: timestamps.hamb6, created_at: timestamps.hamb6, updated_at: timestamps.hamb6},
      {client_id: acaiClient.id, customer_phone: '+5511800000010', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Açaí 500ml', price: 18, quantity: 1}, {name: 'Banana', price: 2, quantity: 1}, {name: 'Granola', price: 2, quantity: 1}, {name: 'Leite em Pó', price: 2, quantity: 1}], address: 'Rua Vergueiro, 456 - Vila Mariana', paymentMethod: 'pix'}), flow_type: 'delivery', started_at: timestamps.acai1, last_message_at: timestamps.acai1, created_at: timestamps.acai1, updated_at: timestamps.acai1},
      {client_id: acaiClient.id, customer_phone: '+5511800000011', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Açaí 1L', price: 32, quantity: 1}, {name: 'Morango', price: 3, quantity: 1}, {name: 'Paçoca', price: 3, quantity: 1}, {name: 'Confete', price: 2, quantity: 1}], address: 'Av. Ipiranga, 123 - Centro', paymentMethod: 'card'}), flow_type: 'delivery', started_at: timestamps.acai2, last_message_at: timestamps.acai2, created_at: timestamps.acai2, updated_at: timestamps.acai2},
      {client_id: acaiClient.id, customer_phone: '+5511800000012', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Açaí 300ml', price: 12, quantity: 2}, {name: 'Banana', price: 2, quantity: 2}, {name: 'Suco de Laranja 300ml', price: 8, quantity: 1}], address: 'Rua da Consolação, 987 - Consolação', paymentMethod: 'cash'}), flow_type: 'delivery', started_at: timestamps.acai3, last_message_at: timestamps.acai3, created_at: timestamps.acai3, updated_at: timestamps.acai3},
      {client_id: acaiClient.id, customer_phone: '+5511800000013', status: 'ongoing', transfer_reason: null, current_state: 'collecting_payment', collected_data: JSON.stringify({items: [{name: 'Açaí 700ml', price: 24, quantity: 1}, {name: 'Morango', price: 3, quantity: 1}], address: 'Rua Estados Unidos, 555 - Jardim América'}), flow_type: 'delivery', started_at: timestamps.acai4, last_message_at: twoHoursAgo, created_at: timestamps.acai4, updated_at: twoHoursAgo},
      {client_id: lanchoneteClient.id, customer_phone: '+5511800000020', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'X-Tudo', price: 22, quantity: 1}, {name: 'Refrigerante Lata', price: 5, quantity: 1}], address: 'Rua República, 333 - República', paymentMethod: 'pix'}), flow_type: 'delivery', started_at: timestamps.lanch1, last_message_at: timestamps.lanch1, created_at: timestamps.lanch1, updated_at: timestamps.lanch1},
      {client_id: lanchoneteClient.id, customer_phone: '+5511800000021', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Coxinha', price: 6, quantity: 3}, {name: 'Kibe', price: 6, quantity: 2}, {name: 'Café', price: 3, quantity: 2}], address: 'Av. São João, 890 - Centro', paymentMethod: 'cash'}), flow_type: 'delivery', started_at: timestamps.lanch2, last_message_at: timestamps.lanch2, created_at: timestamps.lanch2, updated_at: timestamps.lanch2},
      {client_id: lanchoneteClient.id, customer_phone: '+5511800000022', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({items: [{name: 'Bauru', price: 12, quantity: 1}, {name: 'Pastel de Carne', price: 7, quantity: 1}, {name: 'Suco Lata', price: 5, quantity: 1}], address: 'Rua Barão de Itapetininga, 222 - República', paymentMethod: 'card'}), flow_type: 'delivery', started_at: timestamps.lanch3, last_message_at: timestamps.lanch3, created_at: timestamps.lanch3, updated_at: timestamps.lanch3},
      {client_id: boutiqueClient.id, customer_phone: '+5511800000030', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Vestido Longo Festa', size: 'M', color: 'azul', price: 250, gender: 'feminino'}, deliveryType: 'delivery', address: 'Av. Faria Lima, 1000 - Pinheiros', paymentMethod: 'card'}), flow_type: 'clothing', started_at: timestamps.bout1, last_message_at: timestamps.bout1, created_at: timestamps.bout1, updated_at: timestamps.bout1},
      {client_id: boutiqueClient.id, customer_phone: '+5511800000031', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Vestido Midi Florido', size: 'P', color: 'verde', price: 180, gender: 'feminino'}, deliveryType: 'pickup', paymentMethod: 'pix'}), flow_type: 'clothing', started_at: timestamps.bout2, last_message_at: timestamps.bout2, created_at: timestamps.bout2, updated_at: timestamps.bout2},
      {client_id: boutiqueClient.id, customer_phone: '+5511800000032', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Blusa Social Branca', size: 'M', color: 'branca', price: 85, gender: 'feminino'}, deliveryType: 'delivery', address: 'Rua Haddock Lobo, 456 - Jardins', paymentMethod: 'pix'}), flow_type: 'clothing', started_at: timestamps.bout3, last_message_at: timestamps.bout3, created_at: timestamps.bout3, updated_at: timestamps.bout3},
      {client_id: boutiqueClient.id, customer_phone: '+5511800000033', status: 'ongoing', transfer_reason: null, current_state: 'selecting_size', collected_data: JSON.stringify({product: {name: 'Saia Midi Jeans', color: 'azul', gender: 'feminino'}}), flow_type: 'clothing', started_at: timestamps.bout4, last_message_at: new Date(timestamps.bout4.getTime() + 60 * 60 * 1000), created_at: timestamps.bout4, updated_at: new Date(timestamps.bout4.getTime() + 60 * 60 * 1000)},
      {client_id: masculinaClient.id, customer_phone: '+5511800000040', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Camisa Social Branca', size: 'M', color: 'branca', price: 110, gender: 'masculino'}, deliveryType: 'delivery', address: 'Av. Brigadeiro Faria Lima, 2500 - Itaim Bibi', paymentMethod: 'card'}), flow_type: 'clothing', started_at: timestamps.masc1, last_message_at: timestamps.masc1, created_at: timestamps.masc1, updated_at: timestamps.masc1},
      {client_id: masculinaClient.id, customer_phone: '+5511800000041', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Calça Social Preta', size: '42', color: 'preta', price: 130, gender: 'masculino'}, deliveryType: 'pickup', paymentMethod: 'pix'}), flow_type: 'clothing', started_at: timestamps.masc2, last_message_at: timestamps.masc2, created_at: timestamps.masc2, updated_at: timestamps.masc2},
      {client_id: masculinaClient.id, customer_phone: '+5511800000042', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Polo Básica Preta', size: 'G', color: 'preta', price: 65, gender: 'masculino'}, deliveryType: 'delivery', address: 'Rua Pamplona, 789 - Jardins', paymentMethod: 'cash'}), flow_type: 'clothing', started_at: timestamps.masc3, last_message_at: timestamps.masc3, created_at: timestamps.masc3, updated_at: timestamps.masc3},
      {client_id: kidsClient.id, customer_phone: '+5511800000050', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Conjunto Moletom Azul', size: '4', color: 'azul', price: 85, gender: 'masculino'}, deliveryType: 'delivery', address: 'Rua Pedroso Alvarenga, 555 - Itaim Bibi', paymentMethod: 'pix'}), flow_type: 'clothing', started_at: timestamps.kids1, last_message_at: timestamps.kids1, created_at: timestamps.kids1, updated_at: timestamps.kids1},
      {client_id: kidsClient.id, customer_phone: '+5511800000051', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Vestido Princesa', size: '6', color: 'rosa', price: 90, gender: 'feminino'}, deliveryType: 'pickup', paymentMethod: 'card'}), flow_type: 'clothing', started_at: timestamps.kids2, last_message_at: timestamps.kids2, created_at: timestamps.kids2, updated_at: timestamps.kids2},
      {client_id: kidsClient.id, customer_phone: '+5511800000052', status: 'completed', transfer_reason: null, current_state: 'completed', collected_data: JSON.stringify({product: {name: 'Camiseta Estampada Menino', size: '4', color: 'verde', price: 35, gender: 'masculino'}, deliveryType: 'delivery', address: 'Av. Rebouças, 3000 - Pinheiros', paymentMethod: 'pix'}), flow_type: 'clothing', started_at: timestamps.kids3, last_message_at: timestamps.kids3, created_at: timestamps.kids3, updated_at: timestamps.kids3}
    );

    if (conversations.length > 0) {
      await queryInterface.bulkInsert('conversations', conversations);
    }

    const insertedConversations = await queryInterface.sequelize.query(
      `SELECT id, customer_phone FROM conversations WHERE customer_phone LIKE '+55118000000%'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const orders = [];
    for (const conv of insertedConversations) {
      const convData = conversations.find(c => c.customer_phone === conv.customer_phone);
      if (convData && convData.status === 'completed' && convData.collected_data) {
        const data = JSON.parse(convData.collected_data);
        let items, totalAmount, address;

        if (data.items) {
          items = data.items;
          totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          address = data.address;
        } else if (data.product) {
          // Clothing orders - include separate size, color, gender fields
          items = [{
            name: data.product.name,
            price: data.product.price,
            quantity: 1,
            size: data.product.size,
            color: data.product.color,
            gender: data.product.gender
          }];
          totalAmount = data.product.price;
          address = data.deliveryType === 'delivery' ? data.address : null;
        }

        if (items) {
          const statusMap = {'001': 'delivered', '002': 'out_for_delivery', '003': 'preparing', '010': 'delivered', '011': 'confirmed', '012': 'preparing', '020': 'out_for_delivery', '021': 'delivered', '022': 'preparing', '030': 'confirmed', '031': 'preparing', '032': 'out_for_delivery', '040': 'preparing', '041': 'confirmed', '042': 'delivered', '050': 'confirmed', '051': 'preparing', '052': 'delivered'};
          const key = conv.customer_phone.slice(-3);
          const status = statusMap[key] || 'confirmed';

          orders.push({
            conversation_id: conv.id,
            client_id: convData.client_id,
            status: status,
            items: JSON.stringify(items),
            total_amount: totalAmount,
            delivery_address: address,
            payment_method: data.paymentMethod,
            created_at: convData.started_at,
            updated_at: status !== 'confirmed' ? now : convData.started_at
          });
        }
      }
    }

    if (orders.length > 0) {
      await queryInterface.bulkInsert('orders', orders);
    }

    const messages = [];
    for (const conv of insertedConversations) {
      const convData = conversations.find(c => c.customer_phone === conv.customer_phone);
      const baseTime = new Date(convData.started_at);

      if (conv.customer_phone === '+5511800000001') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa noite!', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Quero um hamburger duplo com batata grande e refri', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! 1x Hambúrguer Artesanal Duplo (R$ 38,00), 1x Batata Frita Grande (R$ 18,00) e 1x Refrigerante 600ml (R$ 8,00). Total: R$ 64,00. Qual o endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Paulista, 500 - Bela Vista', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Ótimo! Como prefere pagar? (PIX, Cartão ou Dinheiro)', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Pedido confirmado! 🎉\n\nTotal: R$ 64,00\nEntrega: Rua Paulista, 500\nPagamento: PIX\n\nMuito obrigado! Seu hambúrguer está a caminho! 🚗', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000002') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá, boa noite', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: '2 triplos, 2 onion rings e 2 milk shake chocolate', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Show! 2x Hambúrguer Artesanal Triplo (R$ 96,00), 2x Onion Rings (R$ 30,00) e 2x Milk Shake Chocolate (R$ 28,00). Total: R$ 154,00. Endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Av. Liberdade, 789 - Liberdade', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! Forma de pagamento?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Pedido confirmado! 🎉 Total: R$ 154,00. Entrega em Av. Liberdade, 789. Muito obrigado! Seu hambúrguer está a caminho! 🚗', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000003') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Tem hamburguer vegetariano?', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Sim! Temos Hambúrguer Vegetariano por R$ 32,00. Gostaria de adicionar algo mais?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Sim, batata pequena e suco natural', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Ótimo! 1x Hambúrguer Vegetariano (R$ 32,00), 1x Batata Frita Pequena (R$ 12,00) e 1x Suco Natural (R$ 10,00). Total: R$ 54,00. Endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Oscar Freire, 234 - Jardins', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'PIX', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Pedido confirmado! 🎉 Total: R$ 54,00. Muito obrigado! Seu hambúrguer está a caminho! 🚗', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      } else if (conv.customer_phone === '+5511800000004') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Hamburguer simples e água', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: '1x Hambúrguer Artesanal Simples (R$ 28,00) e 1x Água Mineral (R$ 4,00). Total: R$ 32,00. Qual o endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)}
        );
      } else if (conv.customer_phone === '+5511800000005') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)}
        );
      } else if (conv.customer_phone === '+5511800000006') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Seja bem-vindo à Hamburgueria Premium! 🍔 Estamos prontos para seu pedido!', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Preciso reclamar do pedido que fiz ontem', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Entendo. Vou transferir você para um atendente humano que poderá ajudar melhor com sua reclamação. Aguarde um momento.', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)}
        );
      } else if (conv.customer_phone === '+5511800000010') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo ao Açaí do Bairro! 🍇 Qual o tamanho do seu açaí hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: '500ml com banana, granola e leite em pó', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! 1x Açaí 500ml (R$ 18,00) + Banana (R$ 2,00) + Granola (R$ 2,00) + Leite em Pó (R$ 2,00). Total: R$ 24,00. Endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Vergueiro, 456 - Vila Mariana', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como vai pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigado! Açaí fresquinho a caminho! 😋', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000011') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo ao Açaí do Bairro! 🍇 Qual o tamanho do seu açaí hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Quero 1L com morango paçoca e confete', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Show! 1x Açaí 1L (R$ 32,00) + Morango (R$ 3,00) + Paçoca (R$ 3,00) + Confete (R$ 2,00). Total: R$ 40,00. Qual endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Av. Ipiranga, 123 - Centro', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Forma de pagamento?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigado! Açaí fresquinho a caminho! 😋', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000012') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo ao Açaí do Bairro! 🍇 Qual o tamanho do seu açaí hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: '2 de 300ml com banana e um suco de laranja', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Beleza! 2x Açaí 300ml (R$ 24,00) + 2x Banana (R$ 4,00) + 1x Suco de Laranja 300ml (R$ 8,00). Total: R$ 36,00. Endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua da Consolação, 987 - Consolação', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como vai pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'dinheiro', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigado! Açaí fresquinho a caminho! 😋', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000013') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo ao Açaí do Bairro! 🍇 Qual o tamanho do seu açaí hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: '700ml com morango', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: '1x Açaí 700ml (R$ 24,00) + Morango (R$ 3,00). Total: R$ 27,00. Qual o endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Estados Unidos, 555 - Jardim América', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)}
        );
      } else if (conv.customer_phone === '+5511800000020') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Bom dia', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bom dia! Lanchonete Central aqui. O que vai querer hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Um x-tudo e refri lata', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Beleza! 1x X-Tudo (R$ 22,00) e 1x Refrigerante Lata (R$ 5,00). Total: R$ 27,00. Endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua República, 333 - República', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como vai pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Valeu! Logo, logo seu lanche chega!', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000021') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bom dia! Lanchonete Central aqui. O que vai querer hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: '3 coxinha, 2 kibe e 2 café', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Fechado! 3x Coxinha (R$ 18,00), 2x Kibe (R$ 12,00) e 2x Café (R$ 6,00). Total: R$ 36,00. Qual endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Av. São João, 890 - Centro', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como quer pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Dinheiro', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Valeu! Logo, logo seu lanche chega!', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000022') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bom dia! Lanchonete Central aqui. O que vai querer hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Bauru, pastel de carne e suco lata', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: '1x Bauru (R$ 12,00), 1x Pastel de Carne (R$ 7,00) e 1x Suco Lata (R$ 5,00). Total: R$ 24,00. Endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Barão de Itapetininga, 222 - República', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Forma de pagamento?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'cartao', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Valeu! Logo, logo seu lanche chega!', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000030') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bem-vinda à Boutique Elegância! ✨ Como posso ajudá-la hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Procuro vestido longo azul', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos o Vestido Longo Festa azul por R$ 250,00. Qual tamanho você usa? (P, M ou G)', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'M', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Perfeito! Vestido Longo Festa azul - M por R$ 250,00. Prefere retirar na loja ou entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Qual o endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Av. Faria Lima, 1000 - Pinheiros', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 300000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigada pela preferência! Você vai ficar linda! 💕', message_type: 'text', created_at: new Date(baseTime.getTime() + 301000)}
        );
      } else if (conv.customer_phone === '+5511800000031') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bem-vinda à Boutique Elegância! ✨ Como posso ajudá-la hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Vestido midi verde', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos o Vestido Midi Florido verde por R$ 180,00! Qual tamanho?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'P', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Lindo! Vestido Midi Florido verde - P. Retirada na loja ou entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Vou retirar na loja', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Forma de pagamento?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigada pela preferência! Você vai ficar linda! 💕', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      } else if (conv.customer_phone === '+5511800000032') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bem-vinda à Boutique Elegância! ✨ Como posso ajudá-la hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Blusa social branca M', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Blusa Social Branca tamanho M por R$ 85,00. Entrega ou retirada?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Haddock Lobo, 456 - Jardins', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigada pela preferência! Você vai ficar linda! 💕', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      } else if (conv.customer_phone === '+5511800000033') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Bem-vinda à Boutique Elegância! ✨ Como posso ajudá-la hoje?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Saia jeans azul', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Saia Midi Jeans azul por R$ 95,00. Qual tamanho? (P, M ou G)', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)}
        );
      } else if (conv.customer_phone === '+5511800000040') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja Masculina Top. Procurando algo específico?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Camisa social branca M', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Camisa Social Branca tamanho M por R$ 110,00. Entrega ou retirada na loja?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Qual o endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Av. Brigadeiro Faria Lima, 2500 - Itaim Bibi', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigado! Vai arrasar com essa peça!', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      } else if (conv.customer_phone === '+5511800000041') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja Masculina Top. Procurando algo específico?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Calça social preta 42', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Calça Social Preta tamanho 42 por R$ 130,00. Retirada ou entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Vou retirar', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Forma de pagamento?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'PIX', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigado! Vai arrasar com essa peça!', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000042') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Loja Masculina Top. Procurando algo específico?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Polo preta G', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Polo Básica Preta tamanho G por R$ 65,00. Entrega ou retirada?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Pamplona, 789 - Jardins', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como vai pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'dinheiro', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigado! Vai arrasar com essa peça!', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      } else if (conv.customer_phone === '+5511800000050') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Oi', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Kids Fashion Store! 👶 Procurando roupinha para qual idade?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Conjunto para menino 4 anos azul', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Conjunto Moletom Azul tamanho 4 por R$ 85,00. Entrega ou retirada?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Qual endereço?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Rua Pedroso Alvarenga, 555 - Itaim Bibi', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Forma de pagamento?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigada! Seu pequeno vai ficar lindo! 💙', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      } else if (conv.customer_phone === '+5511800000051') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Boa tarde', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Kids Fashion Store! 👶 Procurando roupinha para qual idade?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Vestido princesa tamanho 6', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Vestido Princesa rosa tamanho 6 por R$ 90,00! Entrega ou retirada?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Retirada', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como prefere pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'cartão', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigada! Seu pequeno vai ficar lindo! 💙', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)}
        );
      } else if (conv.customer_phone === '+5511800000052') {
        messages.push(
          {conversation_id: conv.id, direction: 'incoming', content: 'Olá', message_type: 'text', created_at: new Date(baseTime.getTime())},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Olá! Bem-vindo à Kids Fashion Store! 👶 Procurando roupinha para qual idade?', message_type: 'text', created_at: new Date(baseTime.getTime() + 1000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Camiseta estampada menino 4 anos', message_type: 'text', created_at: new Date(baseTime.getTime() + 60000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Temos Camiseta Estampada Menino verde tamanho 4 por R$ 35,00. Entrega ou retirada?', message_type: 'text', created_at: new Date(baseTime.getTime() + 61000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Entrega', message_type: 'text', created_at: new Date(baseTime.getTime() + 120000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Endereço de entrega?', message_type: 'text', created_at: new Date(baseTime.getTime() + 121000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'Av. Rebouças, 3000 - Pinheiros', message_type: 'text', created_at: new Date(baseTime.getTime() + 180000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Como vai pagar?', message_type: 'text', created_at: new Date(baseTime.getTime() + 181000)},
          {conversation_id: conv.id, direction: 'incoming', content: 'pix', message_type: 'text', created_at: new Date(baseTime.getTime() + 240000)},
          {conversation_id: conv.id, direction: 'outgoing', content: 'Obrigada! Seu pequeno vai ficar lindo! 💙', message_type: 'text', created_at: new Date(baseTime.getTime() + 241000)}
        );
      }
    }

    if (messages.length > 0) {
      await queryInterface.bulkInsert('messages', messages);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', {
      conversation_id: {
        [Sequelize.Op.in]: await queryInterface.sequelize.query(
          `SELECT id FROM conversations WHERE customer_phone LIKE '+55118000000%'`,
          { type: Sequelize.QueryTypes.SELECT }
        ).then(results => results.map(r => r.id))
      }
    }, {});

    await queryInterface.bulkDelete('messages', {
      conversation_id: {
        [Sequelize.Op.in]: await queryInterface.sequelize.query(
          `SELECT id FROM conversations WHERE customer_phone LIKE '+55118000000%'`,
          { type: Sequelize.QueryTypes.SELECT }
        ).then(results => results.map(r => r.id))
      }
    }, {});

    await queryInterface.bulkDelete('conversations', {
      customer_phone: { [Sequelize.Op.like]: '+55118000000%' }
    }, {});
  }
};
