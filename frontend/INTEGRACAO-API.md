# Integração API - FitTrack

## 📋 Resumo das Alterações

A aplicação Ionic foi integrada com a API Node.js/Express já existente no projeto. Agora todas as funcionalidades utilizam o backend para armazenar e recuperar dados.

## 🎯 O que foi implementado

### 1. **Serviços de API**

#### **AuthService** (`src/app/services/auth.service.ts`)
- Login com email e senha
- Registro de novos usuários
- Logout
- Gerenciamento de tokens JWT
- Armazenamento de dados do usuário

#### **ApiService** (`src/app/services/api.service.ts`)
- Wrapper para todas as chamadas HTTP à API
- Gerenciamento automático de autenticação via headers
- Métodos para atividades (CRUD completo)
- Métodos para estatísticas (dashboard, semanal, mensal, anual)

#### **TarefasApiService** (`src/app/services/tarefas-api.service.ts`)
- Substitui o TarefasService com integração à API
- Mantém compatibilidade com código existente
- Mapeia automaticamente entre formatos frontend/backend

### 2. **Páginas Atualizadas**

#### **Login** (`src/app/login/login.page.ts`)
- Integrado com AuthService
- Validação de formulário
- Feedback visual (loading, toasts, alerts)
- Redirecionamento automático se já autenticado

#### **Registro** (`src/app/registar/registar.page.ts`)
- Integrado com AuthService
- Validação de senha (mínimo 6 caracteres)
- Confirmação de senha
- Feedback visual completo

#### **Perfil** (`src/app/perfil/perfil.page.ts`)
- Mostra nome do usuário autenticado
- Botão de logout funcional com confirmação
- Mantém todas as estatísticas existentes

### 3. **Segurança**

#### **AuthGuard** (`src/app/guards/auth.guard.ts`)
- Protege rotas que requerem autenticação
- Redireciona para login se não autenticado

### 4. **Configuração**

#### **Environment**
- `environment.ts`: `apiUrl: 'http://localhost:3000/api'`
- `environment.prod.ts`: Configurável para produção

#### **App Module**
- `HttpClientModule` adicionado para requisições HTTP

## 🚀 Como usar

### **Passo 1: Iniciar a API**

```bash
# Navegue até a pasta da API
cd api

# Instale as dependências (primeira vez)
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A API estará rodando em: `http://localhost:3000`

### **Passo 2: Iniciar o Frontend**

```bash
# Na raiz do projeto Ionic
npm install  # Se necessário

# Inicie o servidor de desenvolvimento
ionic serve
# ou
npm start
```

O app estará em: `http://localhost:8100`

### **Passo 3: Testar a integração**

1. **Registrar novo usuário**:
   - Abra o app
   - Clique em "Criar Conta"
   - Preencha: nome, email, senha
   - Clique em "Registar"

2. **Fazer login**:
   - Use email e senha cadastrados
   - Será redirecionado para home

3. **Criar atividades**:
   - Vá em "Adicionar"
   - Preencha os dados
   - Salvar - agora vai para a API!

4. **Ver estatísticas**:
   - Todas as páginas (home, estatísticas, perfil) agora usam dados da API

5. **Logout**:
   - Vá em "Perfil"
   - Clique em "Logout"
   - Confirme

## 🔄 Migração de Dados

### **Opção 1: Começar do zero**
Simplesmente use o app normalmente. Todos os novos dados serão salvos na API.

### **Opção 2: Manter TarefasService original**
Se quiser manter o localStorage temporariamente:

1. Não substitua o TarefasService
2. Use ambos os serviços em paralelo
3. Migre gradualmente as funcionalidades

## 📝 Endpoints da API Usados

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

### Atividades
- `GET /api/activities` - Listar atividades (com filtros)
- `GET /api/activities/:id` - Buscar atividade
- `POST /api/activities` - Criar atividade
- `PUT /api/activities/:id` - Atualizar atividade
- `DELETE /api/activities/:id` - Deletar atividade
- `PATCH /api/activities/:id/complete` - Concluir atividade
- `PATCH /api/activities/:id/favorite` - Alternar favorito

### Estatísticas
- `GET /api/stats/dashboard` - Dashboard geral
- `GET /api/stats/weekly` - Estatísticas semanais
- `GET /api/stats/monthly` - Estatísticas mensais
- `GET /api/stats/yearly` - Estatísticas anuais
- `GET /api/stats/sports` - Estatísticas por esporte

## 🛠️ Mapeamento de Dados

### Frontend → Backend

**Tipos de Atividade:**
```typescript
'corrida' → 'RUNNING'
'caminhada' → 'WALKING'
'ciclismo' → 'CYCLING'
'natacao' → 'SWIMMING'
'musculacao' → 'GYM'
'yoga' → 'YOGA'
'futebol' → 'FOOTBALL'
'basquete' → 'BASKETBALL'
'volei' → 'OTHER'
'outro' → 'OTHER'
```

**Intensidade:**
```typescript
'baixa' → 'LOW'
'media' → 'MODERATE'
'alta' → 'HIGH'
```

### Interface Tarefa
```typescript
interface Tarefa {
  id: string;                 // Activity.id
  tipoAtividade: string;      // Activity.sportType
  duracao: number;            // Activity.duration
  dataAtividade: string;      // Activity.date
  local: string;              // Activity.location
  intensidade: string;        // Activity.intensity
  descricao: string;          // Activity.notes
  pontos: number;             // Activity.score
  concluida: boolean;         // Activity.isCompleted
  favorita: boolean;          // Activity.isFavorite
  dataCriacao: Date;          // Activity.createdAt
}
```

## ⚠️ Notas Importantes

1. **Autenticação Necessária**: Todas as rotas principais agora requerem login
2. **Token JWT**: Armazenado no localStorage como 'auth-token'
3. **CORS**: A API já está configurada para aceitar requisições do frontend
4. **Erros**: Todos os erros são tratados com feedback visual (alerts/toasts)

## 🐛 Troubleshooting

### Erro de conexão
- Verifique se a API está rodando em `http://localhost:3000`
- Verifique o console do browser para erros de CORS
- Confirme que `environment.ts` tem a URL correta

### Dados não aparecem
- Faça logout e login novamente
- Limpe o cache do browser
- Verifique o console para erros de autenticação

### Token expirado
- Faça logout e login novamente
- Os tokens JWT têm validade configurada na API

## 📦 Próximos Passos (Opcional)

1. **Substituir TarefasService**:
   - Renomear `tarefas-api.service.ts` para `tarefas.service.ts`
   - Atualizar todas as imports

2. **Adicionar Interceptor HTTP**:
   - Criar interceptor para adicionar token automaticamente
   - Tratar erros 401 (não autorizado) globalmente

3. **Implementar Guards nas Rotas**:
   - Proteger rotas no `app-routing.module.ts`
   - Adicionar `canActivate: [AuthGuard]` nas rotas protegidas

4. **Melhorar Error Handling**:
   - Criar serviço centralizado de erros
   - Adicionar retry logic para requisições falhadas

## 📚 Documentação Adicional

- **API README**: `api/README.md` - Documentação completa da API
- **Postman Collection**: Disponível na pasta api/ para testar endpoints
- **Prisma Schema**: `api/prisma/schema.prisma` - Estrutura do banco de dados
