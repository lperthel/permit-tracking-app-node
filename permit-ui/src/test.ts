// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import 'zone.js/testing';

// Webpack-specific require.context type declaration
// This is NOT Node.js require - it's a Webpack bundler feature
declare const require: NodeJS.Require & {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

const testContext = require.context('./', true, /\.spec\.ts$/);
// const testContext = require.context(
//   './app/permits/permit/',
//   false,
//   /permit\.service\.spec\.ts$/
// );
testContext.keys().forEach(testContext);
