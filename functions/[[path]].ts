import worker from '../apps/api/src';
import type {Env} from '../apps/api/src/types';

// Pages Functions comparte la API y sus controles con el Worker local.
export const onRequest: PagesFunction<Omit<Env, 'ASSETS'>> = async context => {
  const assets = {fetch: () => context.next()} as unknown as Fetcher;
  return worker.fetch(context.request, {...context.env, ASSETS: assets});
};
