const STATE_KEYS = {
    USER: 'exomano_user',
    RESTAURANTS: 'exomano_rests',
    CURRENT_REST_ID: 'exomano_curr_id',
    ACCOUNTS: 'exomano_accounts' // Nova chave para gerenciar logins
};

const PLAN_TYPES = {
    GRATUITO: 'UG',
    ESSENCIAL: 'UP',
    EMPRESARIAL: 'UE',
    ADMIN_UA: 'UA'
};
const PLAN_DETAILS = {
    [PLAN_TYPES.GRATUITO]: {
        name: 'Gratuito',
        price: 0,
        maxProducts: 15,
        maxStaff: 6,
        tableLimit: 0
    },
    [PLAN_TYPES.ESSENCIAL]: {
        name: 'Essencial',
        price: 49.90,
        maxProducts: 999,
        maxStaff: 10,
        tableLimit: 12
    },
    [PLAN_TYPES.EMPRESARIAL]: {
        name: 'Empresarial',
        price: 99.90,
        maxProducts: 999,
        maxStaff: 999,
        tableLimit: 9999
    },
    [PLAN_TYPES.ADMIN_UA]: {
        name: 'Admin Global',
        price: 0,
        maxProducts: 9999,
        maxStaff: 9999,
        tableLimit: 9999
    }
};

const State = {
    init() {
        // 1. Inicializa lista de contas (Cadastro de usuários)
        if (!localStorage.getItem(STATE_KEYS.ACCOUNTS)) {
            const initialAccounts = [
                { email: 'admin', pass: 'admin', role: 'UA', plan: 'UA', name: 'Admin Global' },
                { email: 'nathan@teste.com', pass: '123', role: 'UR', plan: 'UG', name: 'Nathan' }
            ];
            localStorage.setItem(STATE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
        }

        // 2. Inicializa Restaurantes
        if (!localStorage.getItem(STATE_KEYS.RESTAURANTS)) {
            const defaultRest = {
                id: Date.now(),
                name: 'Meu Restaurante',
                logo: '',
                ownerEmail: 'nathan@teste.com',
                createdAt: Date.now(),
                status: 'ativo',
                products: [
                    { id: 1, name: 'X-Burger Especial', price: 28.90, category: 'Hambúrgueres', description: 'Pão brioche, blend 180g, queijo cheddar e maionese da casa.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                    { id: 2, name: 'Batata Rústica', price: 15.00, category: 'Acompanhamentos', description: 'Batatas cortadas à mão com alecrim e sal grosso.', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' }
                ],
                staff: [],
                orders: [],
                tables: Array.from({ length: 12 }).map((_, i) => ({ id: Date.now() + i, number: i + 1, name: `Mesa ${i + 1}` })) // Array default de mesas
            };
            localStorage.setItem(STATE_KEYS.RESTAURANTS, JSON.stringify([defaultRest]));
            localStorage.setItem(STATE_KEYS.CURRENT_REST_ID, defaultRest.id);
        }
    },

    // --- NOVA GESTÃO DE AUTENTICAÇÃO (Login e Cadastro com Banco de Dados) ---
    async login(email, pass) {
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pass })
            });
            const data = await response.json();
            
            if (data.success) {
                // Sincronizar com localStorage
                const accounts = JSON.parse(localStorage.getItem(STATE_KEYS.ACCOUNTS)) || [];
                const existingIndex = accounts.findIndex(a => a.email === email);
                if (existingIndex >= 0) accounts[existingIndex] = data.user;
                else accounts.push(data.user);
                localStorage.setItem(STATE_KEYS.ACCOUNTS, JSON.stringify(accounts));
                
                if (data.restaurant) {
                    const rests = this.getRestaurants();
                    const restIndex = rests.findIndex(r => r.id == data.restaurant.id);
                    const frontendRest = {
                        ...data.restaurant,
                        products: [], staff: [], orders: [],
                        tables: Array.from({ length: 12 }).map((_, i) => ({ id: Date.now() + i, number: i + 1, name: `Mesa ${i + 1}` }))
                    };
                    if (restIndex >= 0) rests[restIndex] = { ...rests[restIndex], ...data.restaurant };
                    else rests.push(frontendRest);
                    localStorage.setItem(STATE_KEYS.RESTAURANTS, JSON.stringify(rests));
                    localStorage.setItem(STATE_KEYS.CURRENT_REST_ID, data.restaurant.id);
                }
                
                this.setUser(data.user);
                return data.user;
            }
            return null;
        } catch (error) {
            console.error('Erro na API, usando LocalStorage fallback:', error);
            const accounts = JSON.parse(localStorage.getItem(STATE_KEYS.ACCOUNTS)) || [];
            const user = accounts.find(a => a.email === email && a.pass === pass);
            if (user) {
                this.setUser(user);
                return user;
            }
            return null;
        }
    },

    async register(email, pass, name, restaurantName) {
        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, pass, name: name || email.split('@')[0], restName: restaurantName || 'Meu Restaurante' })
            });
            const data = await response.json();

            if (!data.success) return { success: false, msg: data.msg };

            const accounts = JSON.parse(localStorage.getItem(STATE_KEYS.ACCOUNTS)) || [];
            accounts.push(data.user);
            localStorage.setItem(STATE_KEYS.ACCOUNTS, JSON.stringify(accounts));

            const rests = this.getRestaurants();
            const frontendRest = {
                ...data.restaurant,
                products: [], staff: [], orders: [],
                tables: Array.from({ length: 12 }).map((_, i) => ({ id: Date.now() + i, number: i + 1, name: `Mesa ${i + 1}` }))
            };
            rests.push(frontendRest);
            localStorage.setItem(STATE_KEYS.RESTAURANTS, JSON.stringify(rests));

            return { success: true };
        } catch (error) {
            console.error('Erro na API, usando LocalStorage fallback:', error);
            const accounts = JSON.parse(localStorage.getItem(STATE_KEYS.ACCOUNTS)) || [];
            if (accounts.find(a => a.email === email)) return { success: false, msg: 'E-mail já cadastrado' };

            const newUser = { email, pass, name: name || email.split('@')[0], role: 'UR', plan: 'UG' };
            accounts.push(newUser);
            localStorage.setItem(STATE_KEYS.ACCOUNTS, JSON.stringify(accounts));

            const rests = this.getRestaurants();
            const newRest = {
                id: Date.now(), name: restaurantName || 'Meu Restaurante', logo: '', ownerEmail: email, createdAt: Date.now(), status: 'ativo',
                products: [], staff: [], orders: [], tables: Array.from({ length: 12 }).map((_, i) => ({ id: Date.now() + i, number: i + 1, name: `Mesa ${i + 1}` }))
            };
            rests.push(newRest);
            localStorage.setItem(STATE_KEYS.RESTAURANTS, JSON.stringify(rests));

            return { success: true };
        }
    },

    logout() {
        localStorage.removeItem(STATE_KEYS.USER);
        window.location.reload();
    },

    // --- GESTÃO DE USUÁRIO (Sua lógica original preservada) ---
    getUser() {
        return JSON.parse(localStorage.getItem(STATE_KEYS.USER));
    },

    setUser(userData) {
        localStorage.setItem(STATE_KEYS.USER, JSON.stringify(userData));
        window.dispatchEvent(new Event('statechange'));
    },

    updateUser(data) {
        const user = this.getUser();
        if (!user) return;
        const updated = { ...user, ...data };
        this.setUser(updated);

        // Persistir alteração de plano na lista de contas
        const accounts = this.getAccounts();
        const index = accounts.findIndex(a => a.email === updated.email);
        if (index !== -1) {
            accounts[index] = updated;
            localStorage.setItem(STATE_KEYS.ACCOUNTS, JSON.stringify(accounts));
        }
    },

    // --- GESTÃO DE RESTAURANTES (Sua lógica original preservada) ---
    getRestaurants() {
        return JSON.parse(localStorage.getItem(STATE_KEYS.RESTAURANTS)) || [];
    },

    getAccounts() {
        return JSON.parse(localStorage.getItem(STATE_KEYS.ACCOUNTS)) || [];
    },

    getCurrentRest() {
        const user = this.getUser();
        const rests = this.getRestaurants();
        const id = localStorage.getItem(STATE_KEYS.CURRENT_REST_ID);

        let rest = null;
        if (id) {
            rest = rests.find(r => r.id == id);
        }

        if (!rest && user && user.role === 'UR') {
            rest = rests.find(r => r.ownerEmail === user.email);
        }

        return rest || rests[0];
    },

    updateCurrentRest(data) {
        const rests = this.getRestaurants();
        const index = rests.findIndex(r => r.id == data.id);
        if (index !== -1) {
            rests[index] = data;
            localStorage.setItem(STATE_KEYS.RESTAURANTS, JSON.stringify(rests));
            window.dispatchEvent(new Event('statechange'));
        }
    },

    // --- LÓGICA DE NEGÓCIO E LIMITES (Sua lógica original preservada) ---
    canAdd(type) {
        const user = this.getUser();
        if (!user) return false;
        const rest = this.getCurrentRest();
        const limits = PLAN_DETAILS[user.plan];

        if (type === 'product') return rest.products.length < limits.maxProducts;
        if (type === 'staff') return rest.staff.length < limits.maxStaff;
        return true;
    },

    getLimits() {
        const user = this.getUser();
        return user ? PLAN_DETAILS[user.plan] : PLAN_DETAILS['UG'];
    },

    hasFeature(feature) {
        const user = this.getUser();
        if (!user) return false;
        if (user.role === 'UA') return true;

        const plan = user.plan;
        const features = {
            'UG': ['basic_kds', 'mesa_map'], // Liberado mapa de mesas para Gratuito
            'UP': ['basic_kds', 'mesa_map', 'reports', 'mesa_time'],
            'UE': ['basic_kds', 'mesa_map', 'reports', 'mesa_time', 'analytics_bi', 'live_kitchen', 'custom_branding', 'advanced_reports', 'ticket_medio', 'multi_loja']
        };

        return (features[plan] || []).includes(feature);
    },

    // --- MÉTODOS DA API REST (CRUDs e DASHBOARD) ---
    async apiLoadAdminMetrics() {
        try {
            const res = await fetch('http://localhost:3000/dashboard/admin/geral');
            if (res.ok) return await res.json();
        } catch (e) { console.error('Erro ao buscar métricas do UA', e); }
        return [];
    },
    
    async apiCreateProduct(restId, prod) {
        try {
            await fetch('http://localhost:3000/produtos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ restaurante_id: restId, nome: prod.name, preco: prod.price, categoria: prod.category })
            });
        } catch (e) { console.error('Erro ao criar produto', e); }
    },

    async apiDeleteProduct(prodId) {
        try {
            await fetch('http://localhost:3000/produtos/' + prodId, { method: 'DELETE' });
        } catch (e) { console.error('Erro ao deletar produto', e); }
    },
    
    async apiCreateOrder(restId, orderTotal) {
        try {
            await fetch('http://localhost:3000/pedidos', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ restaurante_id: restId, valor_total: orderTotal })
            });
            // Atualiza a métrica de contabilidade do mês
            const mesAno = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }).replace('/', '-');
            await fetch('http://localhost:3000/dashboard/atualizar', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ restaurante_id: restId, periodo_mes_ano: mesAno, faturamento_adicional: orderTotal, pedidos_adicionais: 1 })
            });
        } catch (e) { console.error('Erro ao registrar pedido e contabilidade', e); }
    },

    getAnalytics() {
        const rest = this.getCurrentRest();
        const orders = rest.orders || [];

        // Total de Vendas (Faturamento)
        const totalSales = orders.reduce((acc, o) => {
            const orderTotal = o.items.reduce((sum, i) => sum + (i.price * i.qnt), 0);
            return acc + orderTotal;
        }, 0);

        // Ticket Médio
        const ticketMedio = orders.length > 0 ? totalSales / orders.length : 0;

        // Produtos Mais Vendidos
        const productSales = {};
        orders.forEach(o => {
            o.items.forEach(i => {
                if (!productSales[i.name]) productSales[i.name] = { name: i.name, qnt: 0, total: 0 };
                productSales[i.name].qnt += i.qnt;
                productSales[i.name].total += (i.price * i.qnt);
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.qnt - a.qnt)
            .slice(0, 5);

        // Performance da Equipe (Vendas, Mesas, Lucro)
        const staffPerformance = {};
        orders.forEach(o => {
            if (o.waiterId) {
                if (!staffPerformance[o.waiterId]) {
                    const staffMember = rest.staff.find(s => s.id == o.waiterId);
                    staffPerformance[o.waiterId] = { 
                        name: staffMember ? staffMember.name : 'Desconhecido', 
                        sales: 0, 
                        tablesServed: new Set(), 
                        profit: 0 
                    };
                }
                const orderTotal = o.items.reduce((sum, i) => sum + (i.price * i.qnt), 0);
                staffPerformance[o.waiterId].sales += orderTotal;
                staffPerformance[o.waiterId].profit += orderTotal * 0.30; // Margem base de 30%
                staffPerformance[o.waiterId].tablesServed.add(o.table);
            }
        });

        const staffStats = Object.values(staffPerformance).map(s => ({
            ...s,
            tablesServed: s.tablesServed.size
        }));

        return {
            totalSales,
            orderCount: orders.length,
            ticketMedio,
            topProducts,
            activeTables: [...new Set(orders.filter(o => o.status !== 'finalizado').map(o => o.table))].length,
            staffStats,
            totalProfit: totalSales * 0.30
        };
    }
};

State.init();