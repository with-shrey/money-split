import express from 'express';
import userRouter from './user';
import expenseRouter from './expense';

const apiRouter = express.Router();

apiRouter.use('/user', userRouter);
apiRouter.use('/expense', expenseRouter);

export default apiRouter;
