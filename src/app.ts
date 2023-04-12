import express from 'express';

import { AppRouter } from './AppRouter';

import './controllers/index';

export const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(AppRouter.router);
