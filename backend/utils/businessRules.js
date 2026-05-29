/**
 * Utilitários de Regras de Negócio e Cálculos - Ei Xomano
 */

// 1. Regras de Cálculo
function calcularTotal(preco, quantidade) {
  if (typeof preco !== 'number' || preco < 0) {
    throw new Error('Preço inválido');
  }
  if (typeof quantidade !== 'number' || quantidade <= 0) {
    throw new Error('Quantidade inválida');
  }
  return preco * quantidade;
}

function calcularDesconto(valorTotal, codigoCupom) {
  if (valorTotal < 0) {
    throw new Error('Valor total não pode ser negativo');
  }
  let desconto = 0;
  if (codigoCupom === 'XOMANO10') {
    desconto = valorTotal * 0.10; // 10%
  } else if (codigoCupom === 'XOMANO50') {
    desconto = valorTotal * 0.50; // 50%
  } else if (codigoCupom === 'FIXO15') {
    desconto = 15.00; // R$15 fixos
  }
  
  const final = valorTotal - desconto;
  return final < 0 ? 0 : Math.round(final * 100) / 100;
}

// 2. Validações de Entrada
function validarEmail(email) {
  if (!email) {
    throw new Error('Email é obrigatório');
  }
  // Regex padrão RFC mais restrito que impede caracteres especiais e múltiplos pontos seguidos
  const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error('Formato de email inválido');
  }
  return true;
}

function validarDatas(dataInicial, dataFinal) {
  if (!dataInicial || !dataFinal) {
    throw new Error('Ambas as datas são obrigatórias');
  }
  
  // Suporte a strings de timestamp numérico
  const parseDate = (val) => {
    if (typeof val === 'string' && /^\d+$/.test(val)) {
      return new Date(Number(val));
    }
    return new Date(val);
  };

  const inicio = parseDate(dataInicial);
  const fim = parseDate(dataFinal);

  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    throw new Error('Data inválida');
  }
  if (inicio > fim) {
    throw new Error('Data inicial não pode ser maior que a data final');
  }
  return true;
}

// 3. Regras de Perfil e Permissão (Planos e Cargos)
const PLAN_DETAILS = {
  'UG': { maxProducts: 15, maxStaff: 6, maxTables: 12, hasMesaMap: true },
  'UP': { maxProducts: 999, maxStaff: 10, maxTables: 12, hasMesaMap: true },
  'UE': { maxProducts: 999, maxStaff: 999, maxTables: 9999, hasMesaMap: true },
  'UA': { maxProducts: 9999, maxStaff: 9999, maxTables: 9999, hasMesaMap: true }
};

function verificarPermissaoPlanos(plano, acao, quantidadeAtual = 0) {
  const limites = PLAN_DETAILS[plano];
  if (!limites) {
    throw new Error('Plano desconhecido');
  }

  if (acao === 'ADICIONAR_PRODUTO') {
    return quantidadeAtual < limites.maxProducts;
  }
  if (acao === 'ADICIONAR_FUNCIONARIO') {
    return quantidadeAtual < limites.maxStaff;
  }
  if (acao === 'ADICIONAR_MESA') {
    return quantidadeAtual < limites.maxTables;
  }
  if (acao === 'ACESSAR_BI_ANALYTICS') {
    return plano === 'UE' || plano === 'UA';
  }
  if (acao === 'EXCLUSIVA_ADMIN_UA') {
    return plano === 'UA';
  }
  return false;
}

module.exports = {
  calcularTotal,
  calcularDesconto,
  validarEmail,
  validarDatas,
  verificarPermissaoPlanos,
  PLAN_DETAILS
};
