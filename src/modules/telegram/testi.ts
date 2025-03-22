import { Telegraf, Markup, Context } from 'telegraf';

// Initialize your bot with token
const bot = new Telegraf('7575430823:AAFuueUyIJGyeBnQqMlh8ycgEJ-4ZOxFeYQ');

// Sample product data with image URLs
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

const products: Product[] = [
  {
    id: 'p1',
    name: 'Smartphone',
    price: 599,
    description: 'Latest model smartphone',
    imageUrl: 'https://example.com/smartphone.jpg',
  },
  {
    id: 'p2',
    name: 'Laptop',
    price: 999,
    description: 'High-performance laptop',
    imageUrl: 'https://example.com/laptop.jpg',
  },
  {
    id: 'p3',
    name: 'Headphones',
    price: 99,
    description: 'Noise-cancelling headphones',
    imageUrl: 'https://example.com/headphones.jpg',
  },
];

bot.on('callback_query', async (ctx) => {
  // Explicit usage
  await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

  // Using context shortcut
  await ctx.answerCbQuery('Thank you for your positive feedback!');
});
// Command to display products with images and buy buttons
bot.command('products', async (ctx) => {
  await ctx.reply(`Hello ${ctx.state.role}`);

  //   for (const product of products) {
  //     // Send photo with caption and inline keyboard
  //     await ctx.replyWithPhoto(
  //       { url: product.imageUrl },
  //       {
  //         caption: `*${product.name}*\nPrice: $${product.price}\n${product.description}`,
  //         parse_mode: 'Markdown',
  //         ...Markup.inlineKeyboard([
  //           Markup.button.callback('🛒 Buy Now', `buy:${product.id}`),
  //           Markup.button.callback('ℹ️ Details', `details:${product.id}`),
  //         ]),
  //       },
  //     );
  //   }
});

// Handle buy button clicks
bot.action(/buy:(.+)/, (ctx) => {
  const productId = ctx.match[1];
  const product = products.find((p) => p.id === productId);

  if (product) {
    ctx.answerCbQuery(`Adding ${product.name} to cart!`);

    // Send confirmation with payment options
    ctx.reply(
      `You're purchasing: ${product.name} for $${product.price}`,
      Markup.inlineKeyboard([
        Markup.button.callback('💳 Credit Card', `pay:card:${productId}`),
        Markup.button.callback('💸 PayPal', `pay:paypal:${productId}`),
        Markup.button.callback('🔙 Back', `back:${productId}`),
      ]),
    );
  } else {
    ctx.answerCbQuery('Product not found!');
  }
});

bot.command('quit', async (ctx) => {
  // Explicit usage

  // Using context shortcut
  await ctx.leaveChat();
});

bot.command('quit', async (ctx: Context) => {
  // Explicit usage

  // Using context shortcut
  await ctx.leaveChat();
});

bot.on('poll_answer', (ctx: Context) => {
  console.log('Poll answer received');
});

bot.on('message', (ctx: Context) => {
  console.dir(ctx, { depth: 10 });
});

// Handle details button clicks
bot.action(/details:(.+)/, (ctx) => {
  const productId = ctx.match[1];
  const product = products.find((p) => p.id === productId);

  if (product) {
    ctx.answerCbQuery(`Showing details for ${product.name}`);
    ctx.reply(
      `*${product.name} - Detailed Specifications*\n\nFull technical details and features would go here...`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('🛒 Buy Now', `buy:${productId}`),
          Markup.button.callback('🔙 Back to Products', 'list_products'),
        ]),
      },
    );
  }
});

// Handle payment method selection
bot.action(/pay:(.+):(.+)/, (ctx) => {
  const [method, productId] = [ctx.match[1], ctx.match[2]];
  const product = products.find((p) => p.id === productId);

  if (product) {
    ctx.answerCbQuery(`Processing ${method} payment...`);
    ctx.reply(`Processing ${method} payment for ${product.name}...`);
    // Here you would implement actual payment processing
  }
});

// Handle back button
bot.action(/back:(.+)/, (ctx) => {
  ctx.answerCbQuery('Going back');
  // You could either re-fetch the product or take them back to products list
  ctx.reply(
    'What would you like to do?',
    Markup.inlineKeyboard([
      Markup.button.callback('🔍 View Products', 'list_products'),
    ]),
  );
});

// Handle list products action
bot.action('list_products', (ctx) => {
  ctx.answerCbQuery('Loading products');
  // Re-trigger the products command
  ctx.reply('Here are our products. Use /products to view them again.');
  // This would trigger the products command handler
});

// Start the bot
bot.launch();
