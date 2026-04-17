const appContainer = document.getElementById('app');

// --- SISTEMA DE ROTEAMENTO (NADA FOI REMOVIDO) ---
let currentActiveView = 'login';
function navigateTo(view) {
    try {
        currentActiveView = view;
        appContainer.innerHTML = '';
        window.scrollTo(0,0);
        
        switch(view) {
            case 'login': renderLogin(); break;
            case 'login-ua': renderLoginUA(); break;
            case 'dashboard': renderDashboard(); break;
            case 'kds': renderKDS(); break;
            case 'mesas': renderMapaMesas(); break;
            case 'produtos': renderProdutos(); break;
            case 'funcionarios': renderStaff(); break;
            case 'planos': renderUpgrade(); break;
            case 'cliente': renderClienteMenu(); break;
            case 'acompanhamento': renderAcompanhamento(); break;
            case 'perfil': renderPerfil(); break;
            case 'admin-ua': renderUA(); break;
            default: renderLogin();
        }
    } catch (e) {
        console.error("Erro ao navegar para " + view, e);
        appContainer.innerHTML = `<div class="p-20 text-center"><h1 class="text-2xl font-black uppercase italic mb-4">Erro ao carregar painel</h1><p class="text-gray-400 font-bold mb-8">${e.message}</p><button onclick="navigateTo('login')" class="ex-btn-primary px-8 py-4">Voltar ao Início</button></div>`;
    }
}

// --- LAYOUT ESTRUTURAL (Sidebar e Header Interativo) ---
function withLayout(content) {
    const user = State.getUser();
    const rest = State.getCurrentRest();
    return `
    <div class="flex min-h-screen">
        <aside class="w-64 bg-white border-r p-6 fixed h-full shadow-sm z-20">
            <h2 class="text-2xl font-bold text-primary-orange italic mb-10">Ei Xomano</h2>
            <nav class="space-y-2">
                <button onclick="navigateTo('dashboard')" class="w-full text-left p-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-500 hover:text-primary-orange transition-all"><i class="fas fa-home mr-3"></i> Início</button>
                <button onclick="navigateTo('kds')" class="w-full text-left p-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-500 hover:text-primary-orange transition-all"><i class="fas fa-utensils mr-3"></i> Cozinha Digital</button>
                ${State.hasFeature('mesa_map') ? `
                <button onclick="navigateTo('mesas')" class="w-full text-left p-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-500 hover:text-primary-orange transition-all"><i class="fas fa-table mr-3"></i> Mapa de Mesas</button>
                ` : ''}
                <button onclick="navigateTo('produtos')" class="w-full text-left p-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-500 hover:text-primary-orange transition-all"><i class="fas fa-hamburger mr-3"></i> Cardápio/Produtos</button>
                <button onclick="navigateTo('perfil')" class="w-full text-left p-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-500 hover:text-primary-orange transition-all"><i class="fas fa-store mr-3"></i> Perfil / Loja</button>
                <button onclick="navigateTo('funcionarios')" class="w-full text-left p-4 hover:bg-orange-50 rounded-2xl font-bold text-gray-500 hover:text-primary-orange transition-all"><i class="fas fa-users mr-3"></i> Equipe</button>
                <button onclick="navigateTo('planos')" class="w-full text-left p-4 bg-purple-50 text-enterprise-purple rounded-2xl font-black mt-10 hover:shadow-lg transition-all"><i class="fas fa-crown mr-3"></i> Upgrade PRO</button>
            </nav>
            <div class="absolute bottom-10 left-6 right-6">
                <button onclick="State.logout()" class="w-full p-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-danger-red transition-colors"><i class="fas fa-power-off mr-2"></i> Encerrar Sessão</button>
            </div>
        </aside>

        <main class="flex-1 ml-64 p-12 bg-gray-50/50">
            <header class="flex justify-between items-center mb-12">
                <div>
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 block">Painel Administrativo</span>
                    <h1 class="text-3xl font-black text-slate-800 tracking-tighter">Olá, ${user.name} 👋</h1>
                </div>
                <div class="flex items-center gap-6">
                    <div class="text-right">
                        <p class="text-sm font-black text-slate-800">${rest.name}</p>
                        <p class="text-[10px] font-bold text-success-green uppercase">● Sistema Online</p>
                    </div>
                    <div class="w-14 h-14 bg-white border-4 border-white shadow-xl rounded-2xl overflow-hidden flex items-center justify-center">
                        <img src="${rest.logo || `https://ui-avatars.com/api/?name=${rest.name}&background=F97316&color=fff`}" class="w-full h-full object-cover">
                    </div>
                </div>
            </header>
            ${content}
        </main>
    </div>`;
}

// --- TELA: LOGIN (MODIFICADA: SEM NOME DO PROPRIETÁRIO) ---
function renderLogin() {
    appContainer.innerHTML = `
    <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div class="ex-card-heavy bg-white p-12 w-full max-w-md shadow-2xl animate-fadeIn">
            <div class="text-center mb-10">
                <div class="inline-block p-4 bg-orange-50 rounded-3xl mb-4">
                    <i class="fas fa-rocket text-primary-orange text-3xl"></i>
                </div>
                <h1 class="text-5xl font-black text-primary-orange italic mb-2 tracking-tighter">Ei Xomano</h1>
                <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Gestão Inteligente de Food Service</p>
            </div>

            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-4">E-mail de Acesso</label>
                    <input id="login-email" type="text" placeholder="exemplo@restaurante.com" 
                        class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-primary-orange focus:bg-white transition-all font-bold">

                    <label class="text-[10px] font-black text-gray-400 uppercase ml-4 mt-4 block">Senha</label>
                    <input id="login-password" type="password" placeholder="Senha" 
                        class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-primary-orange focus:bg-white transition-all font-bold">
                </div>
                
                <button onclick="handleLogin()" class="w-full ex-btn-primary p-5 shadow-xl text-lg mt-4 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    ACESSAR PAINEL <i class="fas fa-arrow-right"></i>
                </button>

                <div class="text-center mt-4">
                    <button onclick="renderRegister()" class="text-primary-orange font-black text-[10px] uppercase hover:underline">Não tem uma conta? Criar conta</button>
                </div>

                <div class="flex items-center gap-4 py-6">
                    <hr class="flex-1 opacity-10">
                    <span class="text-[10px] text-gray-300 font-black uppercase">Segurança Criptografada</span>
                    <hr class="flex-1 opacity-10">
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <button onclick="navigateTo('cliente')" class="p-4 rounded-2xl bg-slate-800 text-white font-black text-[10px] uppercase hover:bg-slate-700 transition-all">Visão Cliente</button>
                    <button onclick="navigateTo('login-ua')" class="p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 font-black text-[10px] uppercase hover:text-primary-orange transition-all">Acesso UA</button>
                </div>
            </div>
        </div>
    </div>`;
}

function renderLoginUA() {
    appContainer.innerHTML = `
    <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div class="bg-white/10 backdrop-blur-xl p-12 w-full max-w-md rounded-[3rem] border border-white/10 shadow-2xl animate-fadeIn">
            <div class="text-center mb-10">
                <div class="inline-block p-4 bg-white/5 rounded-3xl mb-4">
                    <i class="fas fa-shield-alt text-white text-3xl"></i>
                </div>
                <h1 class="text-3xl font-black text-white italic mb-2 tracking-tighter uppercase">Acesso Administrativo</h1>
                <p class="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Área Restrita - Ei Xomano</p>
            </div>

            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase ml-4">Usuário Admin</label>
                    <input id="ua-user" type="text" placeholder="admin" 
                        class="w-full p-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-white/30 text-white transition-all font-bold">

                    <label class="text-[10px] font-black text-slate-400 uppercase ml-4 mt-4 block">Senha de Segurança</label>
                    <input id="ua-pass" type="password" placeholder="•••••" 
                        class="w-full p-5 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-white/30 text-white transition-all font-bold">
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button onclick="navigateTo('login')" class="flex-1 p-5 font-black text-slate-400 uppercase text-xs hover:text-white transition-all">Cancelar</button>
                    <button onclick="handleLoginUA()" class="flex-[2] bg-white text-slate-900 p-5 rounded-3xl shadow-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all">ENTRAR</button>
                </div>

                <div class="text-center mt-8 p-4 bg-white/5 rounded-2xl">
                    <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Acesso de Demonstração: admin / admin</p>
                </div>
            </div>
        </div>
    </div>`;
}

function handleLoginUA() {
    const user = document.getElementById('ua-user').value;
    const pass = document.getElementById('ua-pass').value;

    if (user === 'admin' && pass === 'admin') {
        const adminUser = { email: 'admin', pass: 'admin', role: 'UA', plan: 'UA', name: 'Admin Global' };
        State.setUser(adminUser);
        navigateTo('admin-ua');
    } else {
        alert("Credenciais administrativas inválidas!");
    }
}

function renderRegister() {
    appContainer.innerHTML = `
    <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div class="ex-card-heavy bg-white p-12 w-full max-w-md shadow-2xl animate-fadeIn">
            <div class="text-center mb-10">
                <h1 class="text-4xl font-black text-primary-orange italic mb-2 tracking-tighter">Criar Conta</h1>
                <p class="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Comece a gerir seu restaurante hoje</p>
            </div>

            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-4">Nome do Restaurante</label>
                    <input id="reg-rest-name" type="text" placeholder="Meu Restaurante" 
                        class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-primary-orange focus:bg-white transition-all font-bold">

                    <label class="text-[10px] font-black text-gray-400 uppercase ml-4 mt-4 block">E-mail</label>
                    <input id="reg-email" type="email" placeholder="exemplo@restaurante.com" 
                        class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-primary-orange focus:bg-white transition-all font-bold">

                    <label class="text-[10px] font-black text-gray-400 uppercase ml-4 mt-4 block">Senha</label>
                    <input id="reg-password" type="password" placeholder="Sua Senha" 
                        class="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:border-primary-orange focus:bg-white transition-all font-bold">
                </div>
                
                <button onclick="handleRegister()" class="w-full ex-btn-primary p-5 shadow-xl text-lg mt-4 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    CADASTRAR <i class="fas fa-check"></i>
                </button>

                <div class="text-center mt-4">
                    <button onclick="renderLogin()" class="text-primary-orange font-black text-[10px] uppercase hover:underline">Já tem conta? Fazer Login</button>
                </div>
            </div>
        </div>
    </div>`;
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    if (email === 'admin' && pass === 'admin') {
        const adminUser = { email: 'admin', pass: 'admin', role: 'UA', plan: 'UA', name: 'Admin Global' };
        State.setUser(adminUser);
        navigateTo('admin-ua');
        return;
    }

    if (State.login(email, pass)) {
        const user = State.getUser();
        if (user.role === 'UA') {
            navigateTo('admin-ua');
        } else {
            navigateTo('dashboard');
        }
    } else {
        alert("E-mail ou senha incorretos!");
    }
}

function handleRegister() {
    const restName = document.getElementById('reg-rest-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;

    if(!restName || !email || !pass) return alert("Preencha todos os campos.");

    const res = State.register(email, pass, null, restName);
    if(res.success) {
        alert("Conta criada com sucesso! Faça login.");
        renderLogin();
    } else {
        alert(res.msg);
    }
}

function handleUALogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    if(email === 'admin' && pass === 'admin') {
        const user = State.login(email, pass);
        if(user && user.role === 'UA') {
            navigateTo('admin-ua');
        } else {
            alert("Erro ao acessar painel UA.");
        }
    } else {
        alert("Credenciais UA inválidas. Use usuário 'admin' e senha 'admin'.");
    }
}

// --- TELA: DASHBOARD ---
function renderDashboard() {
    const rest = State.getCurrentRest();
    const analytics = State.getAnalytics();
    const hasReports = State.hasFeature('reports');
    const hasAdvanced = State.hasFeature('advanced_reports');
    const hasTicketMedio = State.hasFeature('ticket_medio');

    const content = `
    <div class="animate-fadeIn">
        <div class="grid grid-cols-4 gap-6 mb-12">
            <div class="ex-card p-8 bg-gradient-to-br from-primary-orange to-secondary-orange text-white shadow-orange-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="p-3 bg-white/20 rounded-2xl"><i class="fas fa-dollar-sign"></i></div>
                    ${hasAdvanced ? '<span class="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full">+12% hoje</span>' : ''}
                </div>
                <p class="text-xs font-bold uppercase opacity-80">Vendas Brutas</p>
                <p class="text-4xl font-black mt-2 tracking-tighter">R$ ${analytics.totalSales.toFixed(2)}</p>
            </div>

            <div class="ex-card p-8 bg-white">
                <div class="flex justify-between items-start mb-4 text-slate-400">
                    <div class="p-3 bg-gray-50 rounded-2xl"><i class="fas fa-shopping-basket"></i></div>
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase">Pedidos Totais</p>
                <p class="text-4xl font-black mt-2 text-slate-800 tracking-tighter">${analytics.orderCount}</p>
            </div>

            <div class="ex-card p-8 bg-white">
                <div class="flex justify-between items-start mb-4 text-slate-400">
                    <div class="p-3 bg-gray-50 rounded-2xl"><i class="fas fa-calculator"></i></div>
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase">Ticket Médio</p>
                <p class="text-4xl font-black mt-2 text-slate-800 tracking-tighter">${hasTicketMedio ? `R$ ${analytics.ticketMedio.toFixed(2)}` : '---'}</p>
            </div>

            <div class="ex-card p-8 bg-white border-2 border-purple-100">
                <div class="flex justify-between items-start mb-4 text-enterprise-purple">
                    <div class="p-3 bg-purple-50 rounded-2xl"><i class="fas fa-crown"></i></div>
                    <span class="text-[10px] font-black bg-purple-100 px-3 py-1 rounded-full uppercase">Plano</span>
                </div>
                <p class="text-xs font-bold text-purple-400 uppercase">Assinatura Atual</p>
                <p class="text-2xl font-black mt-2 text-enterprise-purple uppercase">${State.getLimits().name}</p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-8">
            <div class="col-span-2 ex-card p-10 bg-white">
                <div class="flex justify-between items-center mb-10">
                    <h3 class="text-xl font-black text-slate-800 italic uppercase">
                        ${hasAdvanced ? 'Analytics Inteligente (BI)' : 'Monitoramento de Vendas'}
                    </h3>
                    <div class="flex gap-2">
                        <div class="w-3 h-3 bg-success-green rounded-full animate-pulse"></div>
                        <span class="text-[10px] font-black text-gray-400 uppercase">Live Update</span>
                    </div>
                </div>
                
                ${hasReports ? `
                <div class="h-64 flex items-end gap-4">
                    ${[40, 70, 45, 90, 65, 80, 50, 95, 75, 100].map(h => `
                        <div class="flex-1 bg-gray-50 rounded-t-xl hover:bg-orange-100 transition-all cursor-pointer group relative" style="height: ${h}%">
                            <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-2 rounded hidden group-hover:block whitespace-nowrap">R$ ${h * 10}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-between mt-6 border-t pt-6 text-[10px] font-black text-gray-300 uppercase">
                    <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>00:00</span>
                </div>
                ` : `
                <div class="h-64 flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100">
                    <i class="fas fa-lock text-gray-200 text-4xl mb-4"></i>
                    <p class="text-gray-400 font-black uppercase text-[10px] tracking-widest">Relatórios bloqueados no plano gratuito</p>
                    <button onclick="navigateTo('planos')" class="mt-4 text-primary-orange font-black uppercase text-[10px] hover:underline">Fazer Upgrade agora</button>
                </div>
                `}
            </div>

            <div class="ex-card p-10 bg-slate-800 text-white relative overflow-hidden">
                <div class="relative z-10">
                    <h3 class="text-xl font-black mb-6 italic uppercase">
                        ${hasAdvanced ? 'Mais Vendidos (BI)' : 'Atalhos Rápidos'}
                    </h3>
                    
                    ${hasAdvanced ? `
                        <div class="space-y-4">
                            ${analytics.topProducts.length > 0 ? analytics.topProducts.map((p, i) => `
                                <div class="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
                                    <div class="w-6 h-6 bg-white/10 rounded flex items-center justify-center font-black text-[10px]">${i+1}</div>
                                    <div class="flex-1">
                                        <p class="text-[10px] font-black uppercase">${p.name}</p>
                                        <p class="text-[8px] font-bold text-white/40">${p.qnt} vendas</p>
                                    </div>
                                    <p class="text-[10px] font-black text-primary-orange">R$ ${p.total.toFixed(2)}</p>
                                </div>
                            `).join('') : '<p class="text-center text-white/20 font-bold py-10 uppercase text-[10px]">Sem dados</p>'}
                        </div>
                    ` : `
                        <div class="space-y-3">
                            <button onclick="navigateTo('kds')" class="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-left font-bold transition-all flex items-center justify-between">
                                Ir para Cozinha <i class="fas fa-chevron-right text-[10px]"></i>
                            </button>
                            <button onclick="navigateTo('produtos')" class="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-left font-bold transition-all flex items-center justify-between">
                                Gerenciar Cardápio <i class="fas fa-chevron-right text-[10px]"></i>
                            </button>
                            <button onclick="${State.hasFeature('mesa_map') ? "navigateTo('mesas')" : "alert('O Mapa de Mesas faz parte do Plano Essencial. Faça o upgrade para utilizar!')"}" class="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-left font-bold transition-all flex items-center justify-between">
                                Abrir Mapa de Mesas <i class="fas fa-chevron-right text-[10px]"></i>
                            </button>
                        </div>
                    `}
                </div>
                <i class="fas fa-bolt absolute -bottom-10 -right-10 text-[150px] opacity-5"></i>
            </div>
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

// --- TELA: PERFIL (MODIFICADA: ONDE O USUÁRIO SALVA O NOME) ---
function renderPerfil() {
    const user = State.getUser();
    const rest = State.getCurrentRest();
    
    let content = `
    <div class="max-w-2xl mx-auto animate-fadeIn">
        <div class="ex-card p-10 bg-white shadow-xl">
            <h2 class="text-2xl font-black mb-8 italic text-slate-800 border-b pb-4 uppercase">Configurações do Perfil</h2>
            
            <div class="space-y-6">
                <div class="flex flex-col items-center mb-8">
                    <div id="logo-preview" class="w-32 h-32 bg-gray-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl mb-4 flex items-center justify-center text-gray-300">
                        ${rest.logo ? `<img src="${rest.logo}" class="w-full h-full object-cover">` : `<i class="fas fa-store text-4xl"></i>`}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 w-full">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Upload de Imagem</label>
                            <label class="flex flex-col items-center justify-center w-full h-14 bg-gray-50 border border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-upload text-gray-400 text-xs"></i>
                                    <span class="text-[10px] font-black text-gray-400 uppercase">Escolher Arquivo</span>
                                </div>
                                <input type="file" id="file-logo" class="hidden" accept="image/*" onchange="handleLogoUpload(event)">
                            </label>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Ou via URL</label>
                            <input id="edit-rest-logo" type="text" value="${rest.logo || ''}" placeholder="https://link-da-sua-logo.png" class="w-full h-14 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-orange transition-all font-bold text-xs">
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Nome do Restaurante</label>
                    <input id="edit-rest-name" type="text" value="${rest.name}" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-orange transition-all font-bold">
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] font-black text-gray-400 uppercase ml-2">Nome do Proprietário / Gestor</label>
                    <input id="edit-owner-name" type="text" value="${user.name}" class="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-orange transition-all font-bold">
                </div>

                <div class="pt-6 flex gap-4">
                    <button onclick="navigateTo('dashboard')" class="flex-1 p-4 font-bold text-gray-400 hover:text-slate-600">Cancelar</button>
                    <button onclick="saveProfileChanges()" class="flex-[2] ex-btn-primary p-4 shadow-lg">Salvar Alterações</button>
                </div>
            </div>
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

let base64Logo = null;
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            base64Logo = e.target.result;
            document.getElementById('logo-preview').innerHTML = `<img src="${base64Logo}" class="w-full h-full object-cover">`;
            document.getElementById('edit-rest-logo').value = ''; // Limpa URL se subir arquivo
        };
        reader.readAsDataURL(file);
    }
}

function saveProfileChanges() {
    const rest = State.getCurrentRest();
    const user = State.getUser();
    
    const newRestName = document.getElementById('edit-rest-name').value;
    const newOwnerName = document.getElementById('edit-owner-name').value;
    const newLogoUrl = document.getElementById('edit-rest-logo').value;

    if(!newRestName || !newOwnerName) return alert("Preencha todos os campos!");

    rest.name = newRestName;
    rest.logo = base64Logo || newLogoUrl || rest.logo;
    user.name = newOwnerName;

    State.updateCurrentRest(rest);
    State.setUser(user);
    
    base64Logo = null; // Reseta após salvar
    alert("Perfil atualizado com sucesso!");
    navigateTo('dashboard');
}

// --- TELA: KDS (COZINHA DIGITAL) ---
function renderKDS() {
    const rest = State.getCurrentRest();
    const user = State.getUser();
    const isFree = user.plan === 'UG';

    let content = `
    <div class="animate-fadeIn">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tight">Pedidos em Preparo</h2>
            <div class="flex gap-4 items-center">
                ${isFree ? `
                    <button onclick="openManualQRModal()" class="bg-slate-800 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase hover:bg-slate-700 transition-all">
                        <i class="fas fa-qrcode mr-2"></i> Gerar QR Mesa
                    </button>
                ` : ''}
                <span class="px-4 py-2 bg-orange-100 text-primary-orange rounded-full text-[10px] font-black uppercase">Pendentes: ${rest.orders.length}</span>
            </div>
        </div>
        
        <div class="grid grid-cols-4 gap-6">
            ${rest.orders.map(order => `
                <div class="ex-card overflow-hidden bg-white border-t-8 border-slate-800 flex flex-col h-[450px]">
                    <div class="p-6 border-b bg-gray-50 flex justify-between items-center">
                        <div>
                            <p class="text-[10px] font-black text-gray-400 uppercase">Mesa</p>
                            <h4 class="text-2xl font-black text-slate-800">${order.table}</h4>
                        </div>
                        <span class="text-[10px] font-black bg-white px-3 py-1 rounded-full border shadow-sm">${order.time}</span>
                    </div>
                    
                    <div class="p-6 flex-1 overflow-y-auto space-y-4">
                        ${order.items.map(item => `
                            <div class="flex justify-between items-start group">
                                <div class="flex gap-3">
                                    <span class="bg-orange-50 text-primary-orange w-6 h-6 flex items-center justify-center rounded font-black text-xs">${item.qnt}x</span>
                                    <p class="text-sm font-bold text-slate-700 uppercase tracking-tight">${item.name}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="p-6 bg-gray-50 border-t">
                        <button onclick="completeOrder(${order.id})" class="w-full bg-slate-800 text-white p-4 rounded-2xl font-black text-[10px] uppercase hover:bg-success-green transition-all shadow-lg">Marcar como Pronto</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

function openManualQRModal() {
    const modalHtml = `
    <div id="modal-manual-qr" class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl">
            <h3 class="text-2xl font-black uppercase italic mb-2">Gerador de QR Code</h3>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">Plano Gratuito (Limite: 7 Mesas)</p>
            
            <div class="mb-8">
                <input id="manual-table-input" type="number" min="1" max="7" placeholder="Número da Mesa (1-7)" class="w-full p-6 bg-gray-50 border rounded-3xl text-center text-2xl font-black outline-none focus:border-primary-orange transition-all">
            </div>
            
            <div id="manual-qr-display" class="hidden mb-8">
                <div class="p-6 bg-gray-50 rounded-[2rem] inline-block border-2 border-white shadow-inner">
                    <img id="manual-qr-img" src="" class="w-40 h-40">
                </div>
            </div>
            
            <div class="flex gap-4">
                <button onclick="document.getElementById('modal-manual-qr').remove()" class="flex-1 p-5 font-black text-gray-400 uppercase text-xs hover:text-slate-800 transition-all">Fechar</button>
                <button id="btn-gen-qr" onclick="generateKDSManualQR()" class="flex-[2] ex-btn-primary p-5 shadow-xl text-xs">GERAR CÓDIGO</button>
                <button id="btn-print-qr" onclick="window.print()" class="hidden flex-[2] ex-btn-primary p-5 shadow-xl text-xs"><i class="fas fa-print mr-2"></i> IMPRIMIR</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function generateKDSManualQR() {
    const tableNum = document.getElementById('manual-table-input').value;
    if (!tableNum || tableNum < 1 || tableNum > 7) return alert("Por favor, insira um número de mesa entre 1 e 7.");
    
    const rest = State.getCurrentRest();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/?rest=' + rest.id + '&table=' + tableNum)}`;
    
    document.getElementById('manual-qr-img').src = qrUrl;
    document.getElementById('manual-qr-display').classList.remove('hidden');
    document.getElementById('btn-gen-qr').classList.add('hidden');
    document.getElementById('btn-print-qr').classList.remove('hidden');
}

function completeOrder(id) {
    const rest = State.getCurrentRest();
    rest.orders = rest.orders.filter(o => o.id !== id);
    State.updateCurrentRest(rest);
    renderKDS();
}

// --- TELA: MAPA DE MESAS ---
function renderMapaMesas() {
    const rest = State.getCurrentRest();
    const user = State.getUser();
    const isEnterprise = user.plan === 'UE';
    const isEssential = user.plan === 'UP';
    const isFree = user.plan === 'UG';

    // Se for grátis, bloqueia o mapa e sugere upgrade
    if (isFree) {
        const content = `
        <div class="animate-fadeIn max-w-2xl mx-auto text-center py-20">
            <div class="w-24 h-24 bg-orange-50 text-primary-orange rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                <i class="fas fa-lock"></i>
            </div>
            <h2 class="text-3xl font-black uppercase italic mb-4">Mapa de Mesas Bloqueado</h2>
            <p class="text-gray-400 font-bold mb-12">O Mapa de Mesas interativo está disponível a partir do Plano Essencial. No seu plano atual, você pode gerar QR Codes manualmente na tela de Cozinha Digital.</p>
            <button onclick="navigateTo('planos')" class="ex-btn-primary px-12 py-6 text-sm shadow-2xl">FAZER UPGRADE AGORA</button>
        </div>`;
        appContainer.innerHTML = withLayout(content);
        return;
    }

    // Para Essencial e Empresarial, mostra o Mapa de Mesas
    const tableCount = isEnterprise ? (rest.tables || 12) : 12;
    const content = `
    <div class="animate-fadeIn">
        <div class="flex justify-between items-center mb-10">
            <div>
                <h2 class="text-xl font-black uppercase italic">Mapa de Mesas</h2>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${isEnterprise ? 'Plano Empresarial: Mesas Ilimitadas' : 'Plano Essencial: Limite de 12 Mesas'}</p>
            </div>
            ${isEnterprise ? `
                <button onclick="handleAddTable()" class="ex-btn-primary px-6 py-3 text-xs">+ Adicionar Mesa</button>
            ` : `
                <button onclick="alert('A adição de novas mesas é exclusiva do Plano Empresarial. Faça o upgrade para expandir seu negócio!')" class="bg-gray-100 text-gray-400 px-6 py-3 rounded-2xl text-xs font-black uppercase cursor-not-allowed">+ Adicionar Mesa</button>
            `}
        </div>

        <div class="grid grid-cols-6 gap-6">
            ${Array.from({length: tableCount}).map((_, i) => {
                const tableNum = i + 1;
                const isOccupied = rest.orders.some(o => o.table == tableNum);
                return `
                <div onclick="showTableQR(${tableNum})" class="ex-card p-6 ${isOccupied ? 'border-primary-orange bg-orange-50/30' : 'bg-white'} text-center cursor-pointer hover:scale-105 transition-all group">
                    <div class="w-12 h-12 ${isOccupied ? 'bg-primary-orange text-white' : 'bg-gray-100 text-gray-400'} rounded-2xl flex items-center justify-center mx-auto mb-4 font-black group-hover:shadow-lg transition-all">
                        ${tableNum}
                    </div>
                    <p class="text-[10px] font-black uppercase ${isOccupied ? 'text-primary-orange' : 'text-gray-300'}">
                        ${isOccupied ? 'Ocupada' : 'Livre'}
                    </p>
                    <div class="mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-all">
                        <span class="text-[8px] font-black text-primary-orange uppercase"><i class="fas fa-qrcode mr-1"></i> Ver QR Code</span>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

function generateManualQR() {
    const tableName = document.getElementById('manual-table-name').value;
    if (!tableName) return alert("Digite o nome ou número da mesa!");
    
    const rest = State.getCurrentRest();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/?rest=' + rest.id + '&table=' + tableName)}`;
    
    document.getElementById('qr-image').src = qrUrl;
    document.getElementById('qr-table-label').innerText = "MESA: " + tableName;
    document.getElementById('qr-result').classList.remove('hidden');
}

function showTableQR(tableNum) {
    const rest = State.getCurrentRest();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/?rest=' + rest.id + '&table=' + tableNum)}`;
    
    const modalHtml = `
    <div id="modal-qr" class="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
        <div class="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl">
            <h3 class="text-2xl font-black uppercase italic mb-2">QR Code da Mesa ${tableNum}</h3>
            <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mb-10">Acesso Direto ao Cardápio</p>
            
            <div class="p-8 bg-gray-50 rounded-[3rem] inline-block border-4 border-white shadow-inner mb-8">
                <img src="${qrUrl}" class="w-48 h-48">
            </div>
            
            <div class="flex gap-4">
                <button onclick="document.getElementById('modal-qr').remove()" class="flex-1 p-5 font-black text-gray-400 uppercase text-xs hover:text-slate-800 transition-all">Fechar</button>
                <button onclick="window.print()" class="flex-[2] ex-btn-primary p-5 shadow-xl text-xs"><i class="fas fa-print mr-2"></i> IMPRIMIR CÓDIGO</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleAddTable() {
    const rest = State.getCurrentRest();
    rest.tables = (rest.tables || 12) + 1;
    State.updateCurrentRest(rest);
    renderMapaMesas();
}

// --- TELA: PRODUTOS ---
function renderProdutos() {
    const rest = State.getCurrentRest();
    const content = `
    <div class="animate-fadeIn">
        <div class="flex justify-between items-center mb-10">
            <h2 class="text-xl font-black uppercase italic">Gerenciar Cardápio</h2>
            <button onclick="openModal('modal-add-product')" class="ex-btn-primary px-6 py-3 text-xs">Novo Produto</button>
        </div>

        <div class="grid grid-cols-1 gap-4">
            ${rest.products.map(p => `
                <div class="ex-card p-6 bg-white flex items-center justify-between group hover:border-primary-orange transition-all">
                    <div class="flex items-center gap-6">
                        <div class="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center text-gray-300">
                            ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i class="fas fa-image text-2xl"></i>`}
                        </div>
                        <div>
                            <p class="text-xs font-black text-gray-400 uppercase mb-1">${p.category}</p>
                            <h4 class="font-black text-slate-800 uppercase tracking-tighter">${p.name}</h4>
                            <p class="text-[10px] text-gray-400 line-clamp-1">${p.description || 'Sem descrição'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-12">
                        <p class="font-black text-slate-800">R$ ${p.price.toFixed(2)}</p>
                        <div class="flex gap-2">
                            <button onclick="handleRemoveProduct(${p.id})" class="w-10 h-10 bg-gray-50 rounded-xl text-gray-400 hover:text-danger-red transition-all"><i class="fas fa-trash text-xs"></i></button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div id="modal-add-product" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-fadeIn">
                <h3 class="text-2xl font-black italic uppercase mb-8">Novo Item</h3>
                <div class="space-y-4">
                    <input id="prod-name" type="text" placeholder="Nome do Produto" class="w-full p-4 bg-gray-50 border rounded-2xl font-bold">
                    <input id="prod-price" type="number" placeholder="Preço (R$)" class="w-full p-4 bg-gray-50 border rounded-2xl font-bold">
                    <input id="prod-desc" type="text" placeholder="Descrição" class="w-full p-4 bg-gray-50 border rounded-2xl font-bold">
                    
                    <div class="grid grid-cols-2 gap-4">
                        <label class="flex flex-col items-center justify-center w-full h-14 bg-gray-50 border border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                            <div class="flex items-center gap-2">
                                <i class="fas fa-upload text-gray-400 text-xs"></i>
                                <span class="text-[10px] font-black text-gray-400 uppercase">Upload</span>
                            </div>
                            <input type="file" id="file-prod-image" class="hidden" accept="image/*" onchange="handleProductImageUpload(event)">
                        </label>
                        <input id="prod-image" type="text" placeholder="Ou URL" class="w-full h-14 p-4 bg-gray-50 border rounded-2xl font-bold text-xs">
                    </div>

                    <select id="prod-category" class="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-gray-400">
                        <option value="Burgers">Burgers</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Porções">Porções</option>
                        <option value="Sobremesas">Sobremesas</option>
                    </select>
                    <div class="flex gap-4 pt-6">
                        <button onclick="closeModal('modal-add-product')" class="flex-1 p-4 font-bold text-gray-400">Cancelar</button>
                        <button onclick="handleAddProduct()" class="flex-[2] ex-btn-primary p-4">Salvar Produto</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

let tempProductImage = null;
function handleProductImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tempProductImage = e.target.result;
            document.getElementById('prod-image').value = ''; // Limpa URL se subir arquivo
        };
        reader.readAsDataURL(file);
    }
}

function handleAddProduct() {
    if (!State.canAdd('product')) {
        alert("Limite de produtos atingido para o seu plano.");
        return;
    }

    const name = document.getElementById('prod-name').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const description = document.getElementById('prod-desc').value;
    const image = document.getElementById('prod-image').value;
    const category = document.getElementById('prod-category').value;

    if (!name || isNaN(price)) return alert("Preencha nome e preço corretamente.");

    const rest = State.getCurrentRest();
    rest.products.push({ 
        id: Date.now(), 
        name, 
        price, 
        description, 
        image: tempProductImage || image, 
        category 
    });
    State.updateCurrentRest(rest);
    tempProductImage = null; // Reseta após salvar
    closeModal('modal-add-product');
    renderProdutos();
}

function handleRemoveProduct(id) {
    if (!confirm("Deseja remover este produto?")) return;
    const rest = State.getCurrentRest();
    rest.products = rest.products.filter(p => p.id !== id);
    State.updateCurrentRest(rest);
    renderProdutos();
}

// --- TELA: EQUIPE ---
function renderStaff() {
    const rest = State.getCurrentRest();
    const limits = State.getLimits();
    const content = `
    <div class="animate-fadeIn">
        <div class="flex justify-between items-center mb-10">
            <div>
                <h2 class="text-xl font-black uppercase italic">Equipe e Colaboradores</h2>
                <p class="text-[10px] font-black text-gray-400 uppercase mt-1">Limite do Plano: ${rest.staff.length} / ${limits.maxStaff === 9999 ? 'Ilimitado' : limits.maxStaff}</p>
            </div>
            <button onclick="openModal('modal-add-staff')" class="ex-btn-primary px-6 py-3 text-xs">Novo Acesso</button>
        </div>

        <div class="grid grid-cols-3 gap-6">
            ${rest.staff.map(s => `
                <div class="ex-card p-8 bg-white text-center">
                    <div class="w-20 h-20 bg-orange-50 text-primary-orange rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black border-4 border-white shadow-lg">
                        ${s.name.charAt(0)}
                    </div>
                    <h4 class="font-black text-slate-800 uppercase tracking-tight">${s.name}</h4>
                    <p class="text-[10px] font-black text-gray-300 uppercase mb-6">${s.role === 'waiter' ? 'Atendimento/Garçom' : 'Cozinheiro'}</p>
                    <div class="pt-4 border-t flex justify-center gap-4">
                        <button class="text-[10px] font-black text-primary-orange uppercase">Relatórios</button>
                        <button onclick="handleRemoveStaff(${s.id})" class="text-[10px] font-black text-danger-red uppercase">Remover</button>
                    </div>
                </div>
            `).join('')}
        </div>

        <div id="modal-add-staff" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-fadeIn">
                <h3 class="text-2xl font-black italic uppercase mb-8">Novo Funcionário</h3>
                <div class="space-y-4">
                    <input id="staff-name" type="text" placeholder="Nome do Funcionário" class="w-full p-4 bg-gray-50 border rounded-2xl font-bold">
                    <select id="staff-role" class="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-gray-400">
                        <option value="waiter">Garçom / Atendimento</option>
                        <option value="cook">Cozinheiro</option>
                    </select>
                    <div class="flex gap-4 pt-6">
                        <button onclick="closeModal('modal-add-staff')" class="flex-1 p-4 font-bold text-gray-400">Cancelar</button>
                        <button onclick="handleAddStaff()" class="flex-[2] ex-btn-primary p-4">Salvar Acesso</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

function handleAddStaff() {
    if (!State.canAdd('staff')) {
        alert("Limite de funcionários atingido para o seu plano. Faça upgrade para adicionar mais.");
        return;
    }

    const name = document.getElementById('staff-name').value;
    const role = document.getElementById('staff-role').value;

    if (!name) return alert("Preencha o nome.");

    const rest = State.getCurrentRest();
    rest.staff.push({ id: Date.now(), name, role });
    State.updateCurrentRest(rest);
    closeModal('modal-add-staff');
    renderStaff();
}

function handleRemoveStaff(id) {
    if (!confirm("Deseja remover este funcionário?")) return;
    const rest = State.getCurrentRest();
    rest.staff = rest.staff.filter(s => s.id !== id);
    State.updateCurrentRest(rest);
    renderStaff();
}

// --- TELA: UPGRADE PRO ---
function renderUpgrade() {
    const user = State.getUser();
    const content = `
    <div class="animate-fadeIn max-w-6xl mx-auto text-center">
        <h2 class="text-4xl font-black text-slate-800 italic uppercase mb-4 tracking-tighter">Eleve o Nível do seu Negócio</h2>
        <p class="text-gray-400 font-bold mb-12">Desbloqueie ferramentas avançadas e cresça sem limites.</p>
        
        <div class="grid grid-cols-3 gap-8">
            <!-- Plano Gratuito -->
            <div class="ex-card p-10 bg-white border-4 ${user.plan === 'UG' ? 'border-gray-200' : 'border-white'} transition-all relative overflow-hidden flex flex-col">
                <div class="relative z-10 flex-1">
                    <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 block">Operação Inicial</span>
                    <h3 class="text-3xl font-black text-slate-800 italic uppercase mb-2">Plano Gratuito</h3>
                    <div class="flex items-center justify-center gap-1 mb-8">
                        <span class="text-xl font-black text-slate-800">R$</span>
                        <span class="text-5xl font-black text-slate-800 tracking-tighter">0</span>
                        <span class="text-sm font-bold text-gray-400">/mês</span>
                    </div>
                    
                    <ul class="space-y-4 mb-10 text-left">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> Até 15 Produtos</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> Até 6 Colaboradores</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> QR Code Manual</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-400 opacity-50"><i class="fas fa-times"></i> Sem Mapa de Mesas</li>
                    </ul>
                </div>
                <button onclick="processUpgrade('UG')" class="w-full p-5 border-2 border-gray-200 rounded-2xl font-black text-xs uppercase ${user.plan === 'UG' ? 'bg-gray-100 cursor-default' : 'hover:bg-gray-800 hover:text-white'} transition-all">
                    ${user.plan === 'UG' ? 'Plano Atual' : 'Voltar ao Grátis'}
                </button>
            </div>

            <!-- Plano Essencial -->
            <div class="ex-card p-10 bg-white border-4 ${user.plan === 'UP' ? 'border-primary-orange' : 'border-white'} group hover:border-primary-orange transition-all relative overflow-hidden flex flex-col">
                <div class="relative z-10 flex-1">
                    <span class="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4 block">Ideal para Iniciantes</span>
                    <h3 class="text-3xl font-black text-slate-800 italic uppercase mb-2">Plano Essencial</h3>
                    <div class="flex items-center justify-center gap-1 mb-8">
                        <span class="text-xl font-black text-slate-800">R$</span>
                        <span class="text-5xl font-black text-slate-800 tracking-tighter">49</span>
                        <span class="text-sm font-bold text-gray-400">/mês</span>
                    </div>
                    
                    <ul class="space-y-4 mb-10 text-left">
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> Produtos Ilimitados</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> Até 10 Colaboradores</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> Mapa de Mesas (12)</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-slate-600"><i class="fas fa-check text-success-green"></i> QR Code Automático</li>
                    </ul>
                </div>
                <button onclick="processUpgrade('UP')" class="w-full p-5 border-2 border-slate-800 rounded-2xl font-black text-xs uppercase ${user.plan === 'UP' ? 'bg-slate-800 text-white cursor-default' : 'hover:bg-slate-800 hover:text-white'} transition-all">
                    ${user.plan === 'UP' ? 'Plano Atual' : 'Assinar Essencial'}
                </button>
            </div>

            <!-- Plano Empresarial -->
            <div class="ex-card p-10 bg-slate-800 text-white border-4 ${user.plan === 'UE' ? 'border-enterprise-purple' : 'border-slate-800'} group hover:border-enterprise-purple transition-all relative overflow-hidden flex flex-col">
                <div class="absolute top-6 right-6 bg-enterprise-purple text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recomendado</div>
                <div class="relative z-10 flex-1">
                    <span class="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 block">Escalabilidade Total</span>
                    <h3 class="text-3xl font-black italic uppercase mb-2">Empresarial</h3>
                    <div class="flex items-center justify-center gap-1 mb-8">
                        <span class="text-xl font-black">R$</span>
                        <span class="text-5xl font-black tracking-tighter">99</span>
                        <span class="text-sm font-bold text-white/40">/mês</span>
                    </div>
                    
                    <ul class="space-y-4 mb-10 text-left">
                        <li class="flex items-center gap-3 text-sm font-bold text-white/80"><i class="fas fa-check text-enterprise-purple"></i> Mesas Ilimitadas</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-white/80"><i class="fas fa-check text-enterprise-purple"></i> Geração em Lote QR</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-white/80"><i class="fas fa-check text-enterprise-purple"></i> Inteligência de Dados AI</li>
                        <li class="flex items-center gap-3 text-sm font-bold text-white/80"><i class="fas fa-check text-enterprise-purple"></i> Suporte 24h VIP</li>
                    </ul>
                </div>
                <button onclick="processUpgrade('UE')" class="w-full p-5 bg-enterprise-purple rounded-2xl font-black text-xs uppercase ${user.plan === 'UE' ? 'opacity-50 cursor-default' : 'hover:scale-105'} transition-all shadow-xl">
                    ${user.plan === 'UE' ? 'Plano Atual' : 'Assinar Empresarial'}
                </button>
                <i class="fas fa-crown absolute -bottom-10 -right-10 text-[150px] opacity-5"></i>
            </div>
        </div>
    </div>`;
    appContainer.innerHTML = withLayout(content);
}

function processUpgrade(plan) {
    if (plan === State.getUser().plan) return;
    State.updateUser({ plan });
    alert(`Parabéns! Seu plano foi atualizado para ${plan === 'UE' ? 'Empresarial' : plan === 'UP' ? 'Essencial' : 'Gratuito'}.`);
    navigateTo('dashboard');
}

// --- TELA: CLIENTE (MENU DIGITAL) ---
function renderClienteMenu() {
    const rest = State.getCurrentRest();
    const cartCount = tempOrder.reduce((acc, i) => acc + i.qnt, 0);
    const cartTotal = tempOrder.reduce((acc, i) => acc + (i.price * i.qnt), 0);

    appContainer.innerHTML = `
    <div class="min-h-screen bg-gray-50 animate-fadeIn">
        <header class="bg-white p-8 border-b sticky top-0 z-30">
            <div class="max-w-xl mx-auto flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-black italic text-primary-orange">Mesa 12</h2>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">${rest.name}</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="navigateTo('acompanhamento')" class="relative p-4 bg-gray-50 text-slate-800 rounded-2xl hover:bg-gray-100 transition-all">
                        <i class="fas fa-receipt text-xl"></i>
                    </button>
                    <button onclick="openModal('modal-cart')" class="relative p-4 bg-orange-50 text-primary-orange rounded-2xl hover:bg-orange-100 transition-all">
                        <i class="fas fa-shopping-basket text-xl"></i>
                        ${cartCount > 0 ? `<span class="absolute -top-1 -right-1 bg-primary-orange text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg">${cartCount}</span>` : ''}
                    </button>
                </div>
            </div>
        </header>

        <main class="max-w-xl mx-auto p-6 pb-32">
            <div class="bg-slate-800 p-8 rounded-[2.5rem] mb-10 text-white relative overflow-hidden shadow-2xl">
                <h3 class="text-2xl font-black italic mb-2 relative z-10 uppercase tracking-tighter">O que vai ser hoje?</h3>
                <p class="text-white/60 text-xs font-bold relative z-10">Tudo fresquinho, preparado na hora para você.</p>
                <i class="fas fa-fire absolute -bottom-4 -right-4 text-7xl opacity-10"></i>
            </div>

            <div class="space-y-4">
                ${rest.products.map(p => `
                    <div class="ex-card p-6 bg-white flex gap-6 items-center hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-gray-200/50">
                        <div class="w-24 h-24 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center text-gray-300">
                            ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<i class="fas fa-hamburger text-3xl"></i>`}
                        </div>
                        <div class="flex-1">
                            <p class="text-[8px] font-black text-primary-orange uppercase mb-1">${p.category}</p>
                            <h4 class="font-black text-slate-800 uppercase leading-none mb-2">${p.name}</h4>
                            <p class="text-[10px] text-gray-400 mb-2 line-clamp-1">${p.description || ''}</p>
                            <p class="text-lg font-black text-slate-800 tracking-tighter">R$ ${p.price.toFixed(2)}</p>
                        </div>
                        <button onclick="addToOrder(${p.id})" class="w-12 h-12 bg-gray-50 rounded-2xl text-slate-800 hover:bg-primary-orange hover:text-white transition-all flex items-center justify-center">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </main>

        <div id="modal-cart" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center">
            <div class="bg-white w-full max-w-xl rounded-t-[3rem] p-10 shadow-2xl animate-slide-down max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-2xl font-black italic uppercase">Seu Carrinho</h3>
                    <button onclick="closeModal('modal-cart')" class="text-gray-400 hover:text-slate-800"><i class="fas fa-times text-xl"></i></button>
                </div>
                
                <div class="space-y-6 mb-10">
                    ${tempOrder.length === 0 ? '<p class="text-center text-gray-400 font-bold py-10">Carrinho vazio</p>' : tempOrder.map((item, index) => `
                        <div class="flex justify-between items-center border-b pb-4">
                            <div>
                                <h4 class="font-black text-slate-800 uppercase text-sm">${item.name}</h4>
                                <p class="text-xs font-bold text-primary-orange">R$ ${item.price.toFixed(2)}</p>
                            </div>
                            <div class="flex items-center gap-4">
                                <button onclick="updateCartQnt(${index}, -1)" class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-slate-800"><i class="fas fa-minus text-[10px]"></i></button>
                                <span class="font-black text-sm">${item.qnt}</span>
                                <button onclick="updateCartQnt(${index}, 1)" class="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-slate-800"><i class="fas fa-plus text-[10px]"></i></button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${tempOrder.length > 0 ? `
                    <div class="flex justify-between items-center mb-8">
                        <span class="text-gray-400 font-black uppercase text-xs">Total do Pedido</span>
                        <span class="text-2xl font-black text-slate-800">R$ ${cartTotal.toFixed(2)}</span>
                    </div>
                    <button onclick="confirmOrder()" class="w-full ex-btn-primary p-6 shadow-xl shadow-orange-200 flex justify-between items-center px-10">
                        <span class="font-black italic uppercase tracking-widest text-sm">Confirmar Pedido</span>
                        <i class="fas fa-check text-xs"></i>
                    </button>
                ` : ''}
            </div>
        </div>

        ${cartCount > 0 ? `
        <footer class="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-30">
            <div class="max-w-xl mx-auto">
                <button onclick="openModal('modal-cart')" class="w-full ex-btn-primary p-6 shadow-xl shadow-orange-200 flex justify-between items-center px-10">
                    <div class="flex items-center gap-4">
                        <span class="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black">${cartCount}</span>
                        <span class="font-black italic uppercase tracking-widest text-sm">Ver Carrinho</span>
                    </div>
                    <span class="font-black text-sm">R$ ${cartTotal.toFixed(2)}</span>
                </button>
            </div>
        </footer>
        ` : ''}
    </div>`;
}

let tempOrder = [];
function addToOrder(id) {
    const rest = State.getCurrentRest();
    const product = rest.products.find(p => p.id === id);
    const existing = tempOrder.find(i => i.id === id);
    
    if (existing) {
        existing.qnt++;
    } else {
        tempOrder.push({ ...product, qnt: 1 });
    }
    renderClienteMenu();
}

function updateCartQnt(index, delta) {
    tempOrder[index].qnt += delta;
    if (tempOrder[index].qnt <= 0) {
        tempOrder.splice(index, 1);
    }
    renderClienteMenu();
    if (tempOrder.length > 0) openModal('modal-cart');
}

function confirmOrder() {
    if(tempOrder.length === 0) return alert("Seu carrinho está vazio!");
    
    const rest = State.getCurrentRest();
    const newOrder = {
        id: Date.now(),
        table: 12,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        items: [...tempOrder],
        status: 'preparando'
    };
    
    rest.orders.push(newOrder);
    State.updateCurrentRest(rest);
    tempOrder = [];
    closeModal('modal-cart');
    navigateTo('acompanhamento');
}

// --- TELA: ACOMPANHAMENTO DO CLIENTE ---
function renderAcompanhamento() {
    const rest = State.getCurrentRest();
    const myOrders = rest.orders.filter(o => o.table == 12);

    appContainer.innerHTML = `
    <div class="min-h-screen bg-gray-50 p-6 animate-fadeIn">
        <div class="max-w-xl mx-auto">
            <div class="flex items-center gap-4 mb-10">
                <button onclick="navigateTo('cliente')" class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-800"><i class="fas fa-arrow-left"></i></button>
                <h2 class="text-xl font-black uppercase italic">Status do Pedido</h2>
            </div>

            ${myOrders.length === 0 ? `
                <div class="text-center py-20">
                    <p class="font-bold text-gray-400 uppercase text-xs">Nenhum pedido ativo no momento.</p>
                </div>
            ` : myOrders.map(order => `
                <div class="ex-card p-10 bg-white shadow-xl relative overflow-hidden mb-6">
                    <div class="flex justify-between items-center mb-8 relative z-10">
                        <div>
                            <p class="text-[10px] font-black text-gray-400 uppercase">Pedido #${order.id.toString().slice(-4)}</p>
                            <h3 class="text-2xl font-black text-slate-800 uppercase italic">Em Preparo</h3>
                        </div>
                        <div class="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-primary-orange animate-pulse">
                            <i class="fas fa-utensils text-2xl"></i>
                        </div>
                    </div>

                    <div class="space-y-4 mb-8 relative z-10 border-y py-6">
                        ${order.items.map(item => `
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-bold text-slate-600">${item.qnt}x ${item.name}</span>
                                <span class="text-xs font-black text-slate-800">R$ ${(item.price * item.qnt).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex justify-between items-center relative z-10">
                        <span class="text-xs font-black text-gray-400 uppercase">Tempo estimado: 15-20 min</span>
                        <h4 class="text-xl font-black text-primary-orange">Total R$ ${order.items.reduce((acc, i) => acc + (i.price * i.qnt), 0).toFixed(2)}</h4>
                    </div>
                    
                    <div class="absolute -bottom-10 -right-10 text-[120px] text-gray-50 opacity-50 z-0">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
            `).join('')}
            
            <button onclick="alert('Garçom chamado!')" class="w-full p-6 border-4 border-dashed border-gray-200 rounded-[2.5rem] font-black text-gray-300 uppercase hover:border-primary-orange hover:text-primary-orange transition-all">
                <i class="fas fa-bell mr-2"></i> Chamar Garçom
            </button>
        </div>
    </div>`;
}

// --- TELA: UA (ADMIN GLOBAL - SUPREMO) ---
function renderUA() {
    const rests = State.getRestaurants();
    const accounts = State.getAccounts();
    const totalMRR = rests.reduce((acc, r) => {
        const owner = accounts.find(a => a.email === r.ownerEmail);
        const prices = { 'UG': 0, 'UP': 49.90, 'UE': 99.90 };
        return acc + (prices[owner?.plan] || 0);
    }, 0);

    appContainer.innerHTML = `
    <div class="min-h-screen bg-[#0f172a] text-white font-sans">
        <!-- Header -->
        <header class="bg-[#1e293b] p-6 border-b border-slate-700 flex justify-between items-center px-12">
            <div>
                <h1 class="text-2xl font-bold text-white">Painel Administrativo</h1>
                <p class="text-slate-400 text-sm">Ei Xomano - Gestão Global</p>
            </div>
            <button onclick="State.logout(); navigateTo('login')" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button>
        </header>

        <main class="p-12 max-w-7xl mx-auto">
            <!-- Stats Cards -->
            <div class="grid grid-cols-3 gap-6 mb-12">
                <div class="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <div class="flex items-center gap-3 text-slate-400 mb-4">
                        <i class="fas fa-store"></i> <span class="text-xs font-bold uppercase tracking-wider">Restaurantes</span>
                    </div>
                    <p class="text-4xl font-bold">${rests.length}</p>
                </div>
                <div class="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <div class="flex items-center gap-3 text-slate-400 mb-4">
                        <i class="fas fa-check-circle text-green-500"></i> <span class="text-xs font-bold uppercase tracking-wider">Ativos</span>
                    </div>
                    <p class="text-4xl font-bold">${rests.length}</p>
                </div>
                <div class="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 shadow-xl">
                    <div class="flex items-center gap-3 text-slate-400 mb-4">
                        <i class="fas fa-dollar-sign text-green-500"></i> <span class="text-xs font-bold uppercase tracking-wider">MRR</span>
                    </div>
                    <p class="text-4xl font-bold">R$ ${totalMRR.toFixed(2)}</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-8 border-b border-slate-700 mb-8">
                <button class="pb-4 border-b-2 border-white text-white font-bold flex items-center gap-2">
                    <i class="fas fa-store"></i> Restaurantes
                </button>
                <button class="pb-4 text-slate-400 font-bold flex items-center gap-2 hover:text-white transition-all">
                    <i class="fas fa-cog"></i> Configurações
                </button>
            </div>

            <!-- Search -->
            <div class="relative mb-8">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input type="text" placeholder="Buscar por restaurante ou dono..." class="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-blue-500 transition-all">
            </div>

            <!-- Table -->
            <div class="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-gray-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                        <tr>
                            <th class="p-6">Restaurante</th>
                            <th class="p-6">Dono</th>
                            <th class="p-6">Plano</th>
                            <th class="p-6">Status</th>
                            <th class="p-6">Mesas</th>
                            <th class="p-6">Receita/Mês</th>
                            <th class="p-6">Ações</th>
                        </tr>
                    </thead>
                    <tbody class="text-slate-600 font-bold text-sm">
                        ${rests.map(r => {
                            const owner = accounts.find(a => a.email === r.ownerEmail);
                            const planName = owner?.plan === 'UE' ? 'Empresarial' : owner?.plan === 'UP' ? 'Essencial' : 'Gratuito';
                            const planColor = owner?.plan === 'UE' ? 'bg-purple-100 text-purple-600' : owner?.plan === 'UP' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600';
                            const price = owner?.plan === 'UE' ? 99.90 : owner?.plan === 'UP' ? 49.90 : 0;
                            
                            return `
                            <tr class="border-b hover:bg-gray-50 transition-all">
                                <td class="p-6">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                                            <i class="fas fa-store"></i>
                                        </div>
                                        <div>
                                            <p class="text-slate-800">${r.name}</p>
                                            <p class="text-[10px] text-slate-400">Desde 14/01/2026</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="p-6">${owner?.name || 'N/A'}</td>
                                <td class="p-6">
                                    <span class="px-3 py-1 rounded-full text-[10px] uppercase font-black ${planColor}">${planName}</span>
                                </td>
                                <td class="p-6">
                                    <div class="flex items-center gap-2 text-green-600">
                                        <i class="fas fa-check-circle text-[10px]"></i> Ativo
                                    </div>
                                </td>
                                <td class="p-6">12</td>
                                <td class="p-6 text-slate-800">R$ ${price.toFixed(2)}</td>
                                <td class="p-6">
                                    <div class="flex items-center gap-3">
                                        <button class="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-[10px] uppercase font-black hover:bg-red-100 transition-all">Suspender</button>
                                        <i class="fas fa-ellipsis-v text-slate-300 cursor-pointer"></i>
                                    </div>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Footer Devs -->
            <footer class="mt-12 pt-8 border-t border-slate-700 flex justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <p>© 2026 Ei Xomano - Todos os direitos reservados</p>
                <div class="flex gap-6">
                    <span>Dev: <b class="text-slate-300">Nathan Victor</b></span>
                    <span>Dev: <b class="text-slate-300">Pedro Emanuel</b></span>
                    <span>Dev: <b class="text-slate-300">Jose Eduardo</b></span>
                    <span>Dev: <b class="text-slate-300">Gabriel Henryque</b></span>
                </div>
            </footer>
        </main>
    </div>`;
}

// --- UTILS ---
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// --- SINCRONIZAÇÃO AUTOMÁTICA ---
let syncInterval = null;

function startSync() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(() => {
        // Apenas atualiza o conteúdo se estivermos em telas que dependem de dados em tempo real
        // SEM chamar navigateTo ou resetar o innerHTML de forma agressiva
        if(currentActiveView === 'acompanhamento') renderAcompanhamento();
        if(currentActiveView === 'kds') renderKDS();
        // Dashboard não precisa de re-render constante para não atrapalhar o uso
    }, 10000); // Aumentado para 10 segundos para ser menos intrusivo
}

window.addEventListener('statechange', () => {
    // Quando o estado muda manualmente (ex: salvar perfil), re-renderiza a tela atual
    navigateTo(currentActiveView);
});

startSync();

// Inicialização
State.init();
navigateTo('login');