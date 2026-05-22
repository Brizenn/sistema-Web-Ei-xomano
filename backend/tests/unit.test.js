const { 
  calcularTotal, 
  calcularDesconto, 
  validarEmail, 
  validarDatas, 
  verificarPermissaoPlanos 
} = require('../utils/businessRules');

describe('Testes Unitários - 1. calcularTotal (Cálculos de Valores)', () => {
  // Cenários Válidos (Inteiros e Decimais)
  test('1. Multiplicação simples de inteiros', () => expect(calcularTotal(10, 5)).toBe(50));
  test('2. Multiplicação simples com centavos', () => expect(calcularTotal(12.5, 2)).toBe(25));
  test('3. Preço pequeno de centavos e quantidade alta', () => expect(calcularTotal(0.05, 100)).toBe(5));
  test('4. Quantidade fracionada (permitido em alguns cenários de peso)', () => expect(calcularTotal(15, 1.5)).toBe(22.5));
  test('5. Valor limite muito alto', () => expect(calcularTotal(1000000, 10)).toBe(10000000));
  test('6. Preço zero com quantidade válida deve retornar zero', () => expect(calcularTotal(0, 10)).toBe(0));
  test('7. Multiplicação de dízima periódica arredondada', () => expect(calcularTotal(3.333, 3)).toBe(9.999));
  test('8. Preço unitário pequeno com quantidade unitária', () => expect(calcularTotal(1.01, 1)).toBe(1.01));
  test('9. Preços de produtos premium elevados', () => expect(calcularTotal(899.9, 5)).toBe(4499.5));
  test('10. Preço com quatro casas decimais e quantidade inteira', () => expect(calcularTotal(0.1234, 10)).toBe(1.234));

  // Validações de Erro de Preço (Negativo ou Inválido)
  test('11. Erro para preço negativo inteiro', () => expect(() => calcularTotal(-10, 2)).toThrow('Preço inválido'));
  test('12. Erro para preço negativo com centavos', () => expect(() => calcularTotal(-0.01, 5)).toThrow('Preço inválido'));
  test('13. Erro para preço sendo string numérica', () => expect(() => calcularTotal('25', 2)).toThrow('Preço inválido'));
  test('14. Erro para preço nulo', () => expect(() => calcularTotal(null, 2)).toThrow('Preço inválido'));
  test('15. Erro para preço indefinido (undefined)', () => expect(() => calcularTotal(undefined, 2)).toThrow('Preço inválido'));
  test('16. Erro para preço contendo array', () => expect(() => calcularTotal([10], 2)).toThrow('Preço inválido'));

  // Validações de Erro de Quantidade (Zero, Negativa ou Inválida)
  test('17. Erro para quantidade zero', () => expect(() => calcularTotal(10, 0)).toThrow('Quantidade inválida'));
  test('18. Erro para quantidade negativa', () => expect(() => calcularTotal(10, -5)).toThrow('Quantidade inválida'));
  test('19. Erro para quantidade string', () => expect(() => calcularTotal(10, '3')).toThrow('Quantidade inválida'));
  test('20. Erro para quantidade nula', () => expect(() => calcularTotal(10, null)).toThrow('Quantidade inválida'));
});

describe('Testes Unitários - 2. calcularDesconto (Descontos e Promoções)', () => {
  // Cenários do Cupom XOMANO10 (10% de desconto)
  test('21. XOMANO10 sobre valor inteiro redondo', () => expect(calcularDesconto(100, 'XOMANO10')).toBe(90));
  test('22. XOMANO10 sobre valor pequeno', () => expect(calcularDesconto(10, 'XOMANO10')).toBe(9));
  test('23. XOMANO10 sobre valor com centavos', () => expect(calcularDesconto(25.5, 'XOMANO10')).toBe(22.95));
  test('24. XOMANO10 sobre valor muito grande', () => expect(calcularDesconto(10000, 'XOMANO10')).toBe(9000));
  test('25. XOMANO10 sobre valor de dízima com arredondamento correto', () => expect(calcularDesconto(33.33, 'XOMANO10')).toBe(30));

  // Cenários do Cupom XOMANO50 (50% de desconto)
  test('26. XOMANO50 sobre R$ 100', () => expect(calcularDesconto(100, 'XOMANO50')).toBe(50));
  test('27. XOMANO50 sobre R$ 5', () => expect(calcularDesconto(5, 'XOMANO50')).toBe(2.5));
  test('28. XOMANO50 sobre R$ 15.50', () => expect(calcularDesconto(15.5, 'XOMANO50')).toBe(7.75));
  test('29. XOMANO50 sobre R$ 0', () => expect(calcularDesconto(0, 'XOMANO50')).toBe(0));
  test('30. XOMANO50 sobre valor ímpar de centavos', () => expect(calcularDesconto(10.05, 'XOMANO50')).toBe(5.03)); // Arredondado de 5.025

  // Cenários do Cupom FIXO15 (R$ 15 fixos de desconto)
  test('31. FIXO15 sobre valor maior que R$ 15', () => expect(calcularDesconto(100, 'FIXO15')).toBe(85));
  test('32. FIXO15 sobre valor exatamente igual a R$ 15', () => expect(calcularDesconto(15, 'FIXO15')).toBe(0));
  test('33. FIXO15 sobre valor menor que R$ 15 (deve retornar zero, não negativo)', () => expect(calcularDesconto(10, 'FIXO15')).toBe(0));
  test('34. FIXO15 sobre valor pequeno de centavos', () => expect(calcularDesconto(0.5, 'FIXO15')).toBe(0));
  test('35. FIXO15 sobre valor com centavos acima de 15', () => expect(calcularDesconto(20.75, 'FIXO15')).toBe(5.75));

  // Sem Cupom / Cupons Inválidos / Erros
  test('36. Retornar valor total sem cupom (nulo)', () => expect(calcularDesconto(100, null)).toBe(100));
  test('37. Retornar valor total com cupom inválido', () => expect(calcularDesconto(100, 'CUPOMERRADO')).toBe(100));
  test('38. Retornar valor total com cupom vazio', () => expect(calcularDesconto(50, '')).toBe(50));
  test('39. Diferenciação de letras maiúsculas/minúsculas no cupom', () => expect(calcularDesconto(100, 'xomano10')).toBe(100));
  test('40. Erro ao aplicar desconto sobre valor total negativo', () => expect(() => calcularDesconto(-50, 'XOMANO10')).toThrow('Valor total não pode ser negativo'));
});

describe('Testes Unitários - 3. validarEmail (Validação de Formulário)', () => {
  // E-mails Válidos
  test('41. E-mail padrão comercial', () => expect(validarEmail('contato@eixomano.com')).toBe(true));
  test('42. E-mail com subdomínio', () => expect(validarEmail('suporte@ti.eixomano.com.br')).toBe(true));
  test('43. E-mail com pontos no nome', () => expect(validarEmail('nathan.victor.silva@eixomano.com')).toBe(true));
  test('44. E-mail com hífen', () => expect(validarEmail('dono-restaurante@gmail.com')).toBe(true));
  test('45. E-mail com números', () => expect(validarEmail('admin2026@eixomano.org')).toBe(true));
  test('46. E-mail com underline/sublinhado', () => expect(validarEmail('cozinha_chef@eixomano.net')).toBe(true));
  test('47. E-mail com letra maiúscula (deve ser válido)', () => expect(validarEmail('Nathan@Teste.Com')).toBe(true));
  test('48. E-mail de duas letras', () => expect(validarEmail('a@b.co')).toBe(true));
  test('49. E-mail com domínio longo', () => expect(validarEmail('cliente@restaurantedelicioso-xomano.business')).toBe(true));
  test('50. E-mail com formato internacional', () => expect(validarEmail('user@domain.co.uk')).toBe(true));

  // E-mails Inválidos (Lançam Erro)
  test('51. Erro para email sem arroba', () => expect(() => validarEmail('nathan.eixomano.com')).toThrow('Formato de email inválido'));
  test('52. Erro para email sem domínio', () => expect(() => validarEmail('nathan@')).toThrow('Formato de email inválido'));
  test('53. Erro para email sem nome de usuário', () => expect(() => validarEmail('@eixomano.com')).toThrow('Formato de email inválido'));
  test('54. Erro para email com múltiplos arrobas', () => expect(() => validarEmail('nathan@teste@eixomano.com')).toThrow('Formato de email inválido'));
  test('55. Erro para email com espaços no meio', () => expect(() => validarEmail('nathan victor@eixomano.com')).toThrow('Formato de email inválido'));
  test('56. Erro para email com caracteres especiais proibidos', () => expect(() => validarEmail('nathan#victor@eixomano.com')).toThrow('Formato de email inválido'));
  test('57. Erro para email nulo', () => expect(() => validarEmail(null)).toThrow('Email é obrigatório'));
  test('58. Erro para email indefinido', () => expect(() => validarEmail(undefined)).toThrow('Email é obrigatório'));
  test('59. Erro para email vazio', () => expect(() => validarEmail('')).toThrow('Email é obrigatório'));
  test('60. Erro para formato com pontos seguidos no domínio', () => expect(() => validarEmail('nathan@eixomano..com')).toThrow('Formato de email inválido'));
});

describe('Testes Unitários - 4. validarDatas (Filtro e Agendamento)', () => {
  // Intervalos de Datas Válidos
  test('61. Mesma data e mesmo horário', () => expect(validarDatas('2026-05-20T20:00:00', '2026-05-20T20:00:00')).toBe(true));
  test('62. Data final com um dia a mais', () => expect(validarDatas('2026-05-20', '2026-05-21')).toBe(true));
  test('63. Diferença de um ano', () => expect(validarDatas('2025-05-20', '2026-05-20')).toBe(true));
  test('64. Diferença de segundos', () => expect(validarDatas('2026-05-20T20:00:00', '2026-05-20T20:00:05')).toBe(true));
  test('65. Formato de string de data abreviado', () => expect(validarDatas('2026/05/20', '2026/05/22')).toBe(true));
  test('66. Comparação usando timestamp numérico como string', () => expect(validarDatas('1716238800000', '1716242400000')).toBe(true));
  test('67. Comparação de datas no início do século', () => expect(validarDatas('2000-01-01', '2000-01-02')).toBe(true));
  test('68. Comparação de datas futuras distantes', () => expect(validarDatas('2050-12-31', '2099-12-31')).toBe(true));
  test('69. Formato UTC com timezone', () => expect(validarDatas('2026-05-20T23:00:00Z', '2026-05-21T02:00:00Z')).toBe(true));
  test('70. Data final contendo milissegundos adicionais', () => expect(validarDatas('2026-05-20T20:00:00.000Z', '2026-05-20T20:00:00.001Z')).toBe(true));

  // Intervalos de Datas Inválidos ou Erros
  test('71. Erro quando data inicial é estritamente maior que a final', () => expect(() => validarDatas('2026-05-21', '2026-05-20')).toThrow('Data inicial não pode ser maior que a data final'));
  test('72. Erro quando data inicial é um ano maior', () => expect(() => validarDatas('2027-05-20', '2026-05-20')).toThrow('Data inicial não pode ser maior que a data final'));
  test('73. Erro quando diferença de horário é negativa por um segundo', () => expect(() => validarDatas('2026-05-20T20:00:01', '2026-05-20T20:00:00')).toThrow('Data inicial não pode ser maior que a data final'));
  test('74. Erro quando a data inicial é nula', () => expect(() => validarDatas(null, '2026-05-20')).toThrow('Ambas as datas são obrigatórias'));
  test('75. Erro quando a data final é nula', () => expect(() => validarDatas('2026-05-20', null)).toThrow('Ambas as datas são obrigatórias'));
  test('76. Erro quando ambas as datas são nulas', () => expect(() => validarDatas(null, null)).toThrow('Ambas as datas são obrigatórias'));
  test('77. Erro quando formato da data inicial é inválido', () => expect(() => validarDatas('data-invalida', '2026-05-20')).toThrow('Data inválida'));
  test('78. Erro quando formato da data final é inválido', () => expect(() => validarDatas('2026-05-20', 'outra-data-invalida')).toThrow('Data inválida'));
  test('79. Erro quando o formato é completamente inaceitável', () => expect(() => validarDatas('987654321000', '123456789000')).toThrow('Data inicial não pode ser maior que a data final')); // Timestamps invertidos
  test('80. Erro quando as datas passadas são indefinidas (undefined)', () => expect(() => validarDatas(undefined, undefined)).toThrow('Ambas as datas são obrigatórias'));
});

describe('Testes Unitários - 5. verificarPermissaoPlanos (Níveis de Acesso e Limites)', () => {
  // Plano Gratuito - UG (Limite 15 Produtos, 6 Funcionários)
  test('81. UG - Permite adicionar o 1º produto', () => expect(verificarPermissaoPlanos('UG', 'ADICIONAR_PRODUTO', 0)).toBe(true));
  test('82. UG - Permite adicionar o 15º produto (limite não estourado)', () => expect(verificarPermissaoPlanos('UG', 'ADICIONAR_PRODUTO', 14)).toBe(true));
  test('83. UG - Bloqueia adicionar o 16º produto (atingiu limite de 15)', () => expect(verificarPermissaoPlanos('UG', 'ADICIONAR_PRODUTO', 15)).toBe(false));
  test('84. UG - Bloqueia adicionar produto se já tiver 20 (acima do limite)', () => expect(verificarPermissaoPlanos('UG', 'ADICIONAR_PRODUTO', 20)).toBe(false));
  test('85. UG - Permite adicionar o 6º funcionário', () => expect(verificarPermissaoPlanos('UG', 'ADICIONAR_FUNCIONARIO', 5)).toBe(true));
  test('86. UG - Bloqueia adicionar o 7º funcionário (atingiu limite de 6)', () => expect(verificarPermissaoPlanos('UG', 'ADICIONAR_FUNCIONARIO', 6)).toBe(false));
  test('87. UG - Bloqueia acesso ao BI/Analytics de gestão', () => expect(verificarPermissaoPlanos('UG', 'ACESSAR_BI_ANALYTICS')).toBe(false));

  // Plano Essencial - UP (Limite 999 Produtos, 10 Funcionários)
  test('88. UP - Permite adicionar produto com 100 cadastrados', () => expect(verificarPermissaoPlanos('UP', 'ADICIONAR_PRODUTO', 100)).toBe(true));
  test('89. UP - Bloqueia produto apenas acima de 999', () => expect(verificarPermissaoPlanos('UP', 'ADICIONAR_PRODUTO', 999)).toBe(false));
  test('90. UP - Permite adicionar o 10º funcionário', () => expect(verificarPermissaoPlanos('UP', 'ADICIONAR_FUNCIONARIO', 9)).toBe(true));
  test('91. UP - Bloqueia adicionar o 11º funcionário (atingiu limite de 10)', () => expect(verificarPermissaoPlanos('UP', 'ADICIONAR_FUNCIONARIO', 10)).toBe(false));
  test('92. UP - Bloqueia acesso ao BI/Analytics empresarial', () => expect(verificarPermissaoPlanos('UP', 'ACESSAR_BI_ANALYTICS')).toBe(false));

  // Plano Empresarial - UE (Limite 999 Produtos, 999 Funcionários)
  test('93. UE - Permite adicionar produto com 500 cadastrados', () => expect(verificarPermissaoPlanos('UE', 'ADICIONAR_PRODUTO', 500)).toBe(true));
  test('94. UE - Permite adicionar o 50º funcionário sem problemas', () => expect(verificarPermissaoPlanos('UE', 'ADICIONAR_FUNCIONARIO', 50)).toBe(true));
  test('95. UE - Permite acesso liberado ao BI/Analytics', () => expect(verificarPermissaoPlanos('UE', 'ACESSAR_BI_ANALYTICS')).toBe(true));
  test('96. UE - Bloqueia ações de administração geral do UA', () => expect(verificarPermissaoPlanos('UE', 'EXCLUSIVA_ADMIN_UA')).toBe(false));

  // Plano Admin Global - UA (Acesso Total)
  test('97. UA - Permite adicionar produto mesmo com volume muito alto', () => expect(verificarPermissaoPlanos('UA', 'ADICIONAR_PRODUTO', 5000)).toBe(true));
  test('98. UA - Acesso irrestrito ao BI/Analytics', () => expect(verificarPermissaoPlanos('UA', 'ACESSAR_BI_ANALYTICS')).toBe(true));
  test('99. UA - Permissão total de ações exclusivas de admin', () => expect(verificarPermissaoPlanos('UA', 'EXCLUSIVA_ADMIN_UA')).toBe(true));

  // Planos Inexistentes ou Ações Inválidas
  test('100. Erro ao tentar validar permissão para plano desconhecido', () => expect(() => verificarPermissaoPlanos('PLANO_FALSO', 'ADICIONAR_PRODUTO')).toThrow('Plano desconhecido'));
  test('101. Retornar falso para ação não mapeada', () => expect(verificarPermissaoPlanos('UG', 'ACAO_INEXISTENTE')).toBe(false));
});
