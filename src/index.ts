import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { authGuard, adminGuard } from './mwAuth';

const prisma = new PrismaClient();
const app = express();

// --- Fix para BigInt JSON ---
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

app.use(cors());
app.use(express.json());

// Salud
app.get('/health', (_req, res) => res.json({ ok: true }));

// Quien soy (y si soy admin)
app.get('/me', authGuard, (req, res) => {
  const uid = (req as any).uid as string;
  const admins = (process.env.ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
  res.json({ uid, isAdmin: admins.includes(uid) });
});

// Catálogo público
app.get('/menu', async (_req, res) => {
  const [pizzas, ingredients, drinks] = await Promise.all([
    prisma.pizzas.findMany({ where: { is_active: true } }),
    prisma.ingredients.findMany({ where: { is_active: true } }),
    prisma.drinks.findMany({ where: { is_active: true } }),
  ]);
  res.json({ pizzas, ingredients, drinks });
});

// ====== ADMIN CRUD ======
app.get('/admin/pizzas', authGuard, adminGuard, async (_req, res) => {
  res.json(await prisma.pizzas.findMany());
});
app.post('/admin/pizzas', authGuard, adminGuard, async (req, res) => {
  const { name, base_price, is_active = true } = req.body;
  const row = await prisma.pizzas.create({ data: { name, base_price, is_active } });
  res.json(row);
});
app.put('/admin/pizzas/:id', authGuard, adminGuard, async (req, res) => {
  const id = BigInt(req.params.id);
  const { name, base_price, is_active } = req.body;
  const row = await prisma.pizzas.update({ where: { id }, data: { name, base_price, is_active } });
  res.json(row);
});
app.delete('/admin/pizzas/:id', authGuard, adminGuard, async (req, res) => {
  const id = BigInt(req.params.id);
  await prisma.pizzas.delete({ where: { id } });
  res.json({ ok: true });
});

// ingredients
app.get('/admin/ingredients', authGuard, adminGuard, async (_req, res) => {
  res.json(await prisma.ingredients.findMany());
});
app.post('/admin/ingredients', authGuard, adminGuard, async (req, res) => {
  const { name, price, is_active = true } = req.body;
  const row = await prisma.ingredients.create({ data: { name, price, is_active } });
  res.json(row);
});
app.put('/admin/ingredients/:id', authGuard, adminGuard, async (req, res) => {
  const id = BigInt(req.params.id);
  const { name, price, is_active } = req.body;
  const row = await prisma.ingredients.update({ where: { id }, data: { name, price, is_active } });
  res.json(row);
});
app.delete('/admin/ingredients/:id', authGuard, adminGuard, async (req, res) => {
  const id = BigInt(req.params.id);
  await prisma.ingredients.delete({ where: { id } });
  res.json({ ok: true });
});

// drinks
app.get('/admin/drinks', authGuard, adminGuard, async (_req, res) => {
  res.json(await prisma.drinks.findMany());
});
app.post('/admin/drinks', authGuard, adminGuard, async (req, res) => {
  const { name, price, is_active = true } = req.body;
  const row = await prisma.drinks.create({ data: { name, price, is_active } });
  res.json(row);
});
app.put('/admin/drinks/:id', authGuard, adminGuard, async (req, res) => {
  const id = BigInt(req.params.id);
  const { name, price, is_active } = req.body;
  const row = await prisma.drinks.update({ where: { id }, data: { name, price, is_active } });
  res.json(row);
});
app.delete('/admin/drinks/:id', authGuard, adminGuard, async (req, res) => {
  const id = BigInt(req.params.id);
  await prisma.drinks.delete({ where: { id } });
  res.json({ ok: true });
});

// (Ya tenías) crear orden pagada
// app.post('/orders', authGuard, ...)

app.listen(4000, () => console.log('API on http://localhost:4000'));