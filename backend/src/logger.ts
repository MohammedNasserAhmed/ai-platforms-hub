import pino from 'pino';

const base: any = { level: process.env.LOG_LEVEL || 'info' };
// Only attempt pretty transport if explicitly requested AND module likely installed.
if (process.env.PINO_PRETTY === '1') {
  try {
    // dynamic require to prevent bundler resolution failures
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require.resolve('pino-pretty');
    base.transport = { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } };
  } catch {
    // ignore if not installed
  }
}
export const logger = pino(base);
