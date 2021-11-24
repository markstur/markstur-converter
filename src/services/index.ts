import { Container } from 'typescript-ioc';

export * from './hello-world.api';
export * from './hello-world.service';
export * from './converter.api';
export * from './converter.service';

import config from './ioc.config';

Container.configure(...config);
