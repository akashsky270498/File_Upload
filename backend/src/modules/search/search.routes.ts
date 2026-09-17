import { Router } from 'express';
import { searchController } from './search.controller';
import './search.swagger';

const router = Router();

router.post('/', searchController.search);

export default router;
