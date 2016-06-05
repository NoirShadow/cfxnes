/* eslint-env mocha */
/* eslint-disable no-sparse-arrays, no-unused-expressions */

import chai from 'chai';
import * as arrays from '../../src/utils/array';

const expect = chai.expect;

describe('Arrays utils', () => {
  it('can make array', () => {
    expect(arrays.makeArray(0)).to.deep.equal([]);
    expect(arrays.makeArray(2)).to.deep.equal([0, 0]);
    expect(arrays.makeArray(2, 'x')).to.deep.equal(['x', 'x']);
  });

  it('can zero array', () => {
    let array;
    expect(arrays.zeroArray(array = [])).to.equal(array);
    expect(arrays.zeroArray([1, 2, 3])).to.deep.equal([0, 0, 0]);
    expect(arrays.zeroArray([1, 2, 3], 1)).to.deep.equal([1, 0, 0]);
    expect(arrays.zeroArray([1, 2, 3], 1, 2)).to.deep.equal([1, 0, 3]);
    expect(arrays.zeroArray([1, 2, 3], 0, 4)).to.deep.equal([0, 0, 0]);
  });

  it('can fill array', () => {
    let array;
    expect(arrays.fillArray(array = [])).to.equal(array);
    expect(arrays.fillArray([1, 2, 3], 'x')).to.deep.equal(['x', 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1)).to.deep.equal([1, 'x', 'x']);
    expect(arrays.fillArray([1, 2, 3], 'x', 1, 2)).to.deep.equal([1, 'x', 3]);
    expect(arrays.fillArray([1, 2, 3], 'x', 0, 4)).to.deep.equal(['x', 'x', 'x']);
  });

  it('can copy array', () => {
    let array;
    expect(arrays.copyArray(array = [])).not.to.equal(array);
    expect(arrays.copyArray([], array = [])).to.equal(array);
    expect(arrays.copyArray([1, 2, 3])).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2], new Array(3))).to.deep.equal([1, 2]);
    expect(arrays.copyArray([1, 2, 3], new Array(3))).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3, 4], new Array(3))).to.deep.equal([1, 2, 3]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1)).to.deep.equal([2, 3]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1, 1)).to.deep.equal([, 2, 3]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1, 1, 1)).to.deep.equal([, 2]);
    expect(arrays.copyArray([1, 2, 3], new Array(3), 1, 2, 3)).to.deep.equal([,, 2]);
  });

  it('can test subarray containment', () => {
    expect(arrays.containsSubarray([1, 2, 3], [1, 2, 3, 4])).to.be.false;
    expect(arrays.containsSubarray([1, 2, 3], [1, 2, 3])).to.be.true;
    expect(arrays.containsSubarray([1, 2, 3], [1, 2])).to.be.true;
    expect(arrays.containsSubarray([], [])).to.be.true;
    expect(arrays.containsSubarray([1, 2, 3], [2, 3], 2)).to.be.false;
    expect(arrays.containsSubarray([1, 2, 3], [2, 3], 1)).to.be.true;
    expect(arrays.containsSubarray([1, 2, 3], [2, 3], 0)).to.be.false;
  });
});