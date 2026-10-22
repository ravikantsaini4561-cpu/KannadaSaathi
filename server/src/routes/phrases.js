import { Router } from 'express';
import { getAll, getOne, categories, tokenize, score } from '../store.js';

const router = Router();

router.get('/categories', (req, res) => res.json(categories));

router.get('/phrases', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let list = await getAll();
    if (category) list = list.filter((p) => p.category === category);
    const words = tokenize(search);
    if (words.length) {
      list = list.map((p) => ({ p, s: score(p, words) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.p);
    }
    res.json(list);
  } catch (e) { next(e); }
});

router.get('/phrases/:id', async (req, res, next) => {
  try {
    const phrase = await getOne(req.params.id);
    if (!phrase) return res.status(404).json({ error: 'Phrase not found' });
    res.json(phrase);
  } catch (e) { next(e); }
});

export default router;
