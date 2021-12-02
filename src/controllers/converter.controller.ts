import { GET, Path, QueryParam } from 'typescript-rest';
import { Inject } from 'typescript-ioc';
import { ConverterApi } from '../services';
import { LoggerApi } from '../logger';

@Path('/converter')
export class ConverterController {
  @Inject
  service: ConverterApi;
  @Inject
  _baseLogger: LoggerApi;

  get logger() {
    return this._baseLogger.child('ConverterController');
  }

  @Path('to-number')
  @GET
  toNumber(@QueryParam('value') value: string): number {
    this.logger.info(`To number from ${value}`);
    return this.service.toNumber(value);
  }

  @Path('to-roman')
  @GET
  toRoman(@QueryParam('value') value: number): string {
    this.logger.info(`To Roman from ${value}`);
    return this.service.toRoman(value);
  }
}
