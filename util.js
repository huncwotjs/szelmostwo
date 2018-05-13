// Copyright 2018 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Promise = require('bluebird');

const { join } = require('path');

const parsePath = require('path-to-regexp');

function compose(...middlewareList) {
  return async (ctx, next) => {
    await middlewareList.reduceRight(
      (acc, fn) => async () => await fn(ctx, acc),
      () => ctx // noop
    )();
  };
}

function match(options = {}) {
  return route => {
    const keys = [];
    const reg = parsePath.apply(this, [route, keys, options]);

    return route => {
      const res = reg.exec(route);
      const params = {};

      if (!res) return false;

      for (let i = 1, l = res.length; i < l; i++) {
        if (!res[i]) continue;
        params[keys[i - 1].name] = res[i];
      }

      return params;
    };
  };
}

const isObject = _ => !!_ && _.constructor === Object;

module.exports = { compose, match, isObject };
