import { Main } from './class/Main.class';
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    main: Main;
  }
}