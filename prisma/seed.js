const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o Seed...');

  // 1. Opcional: Limpar dados antigos antes de criar novos (Cuidado se rodar em produção!)
  // Descomente as linhas abaixo se quiser que o comando apague tudo antes de criar
  // await prisma.pedidos.deleteMany();
  // await prisma.produtos.deleteMany();
  // await prisma.restaurantes.deleteMany();
  // await prisma.usuarios.deleteMany();

  // 2. Criar Usuário Admin Global
  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@eixomano.com' },
    update: {},
    create: {
      nome: 'Administrador Supremo',
      email: 'admin@eixomano.com',
      senha: 'admin', // Em um app real, colocar senha criptografada (bcrypt)
      cargo: 'UA'
    }
  });
  console.log('✅ Usuário Admin criado:', admin.email);

  // 3. Criar Dono de Restaurante
  const dono = await prisma.usuarios.upsert({
    where: { email: 'dono@restaurante.com' },
    update: {},
    create: {
      nome: 'João Dono',
      email: 'dono@restaurante.com',
      senha: '123',
      cargo: 'UR'
    }
  });
  console.log('✅ Usuário Dono criado:', dono.email);

  // 4. Criar Restaurante
  const rest = await prisma.restaurantes.create({
    data: {
      nome: 'Restaurante Exemplo',
      dono_id: dono.id,
      plano: 'UP',
      ativo: true
    }
  });
  console.log('✅ Restaurante criado:', rest.nome);

  // 5. Criar Produto para esse Restaurante
  const produto = await prisma.produtos.create({
    data: {
      restaurante_id: rest.id,
      nome: 'Hambúrguer Clássico',
      preco: 25.90,
      categoria: 'Lanches'
    }
  });
  console.log('✅ Produto criado:', produto.nome);

  console.log('🚀 Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
