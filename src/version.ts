declare const __PACKAGE_VERSION__: string | undefined;

/**
 * The package version injected at build-time by tsup or test runner by vitest.
 * Defaults to '1.0.0' if __PACKAGE_VERSION__ is undefined in an untranspiled environment.
 */
export const VERSION: string =
  typeof __PACKAGE_VERSION__ !== 'undefined'
    ? __PACKAGE_VERSION__
    : '1.0.0';
