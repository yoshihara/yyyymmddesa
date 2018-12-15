'use strict';

import moment from 'moment';

import Extractor from '../src/js/lib/extractor';
import { headerWithRootCategory, headerWithRootCategories, headerWithoutRootCategory } from './fixtures/postHeaders';
jest.unmock('../src/js/lib/extractor.js');

describe('Extractor', () => {
  describe('.currentPostInfo', () => {
    describe('when target post has a category before yyyy/mm/dd', () => {
      beforeEach(() => {
        document.body.innerHTML = headerWithRootCategory;
      });

      it('should return info', () => {
        const date = new moment('2017/12/11', 'YYYY/MM/DD');
        expect(Extractor.currentPostInfo()).toEqual({
          date: date,
          name: 'hyoshihara04',
          root: 'daily-report',
          teamName: 'bomberowl-test',
        });
      });
    });

    describe('when target post has categories before yyyy/mm/dd', () => {
      beforeEach(() => {
        document.body.innerHTML = headerWithRootCategories;
      });

      it('should return info', () => {
        const date = new moment('2018/12/10', 'YYYY/MM/DD');
        expect(Extractor.currentPostInfo()).toEqual({
          date: date,
          name: 'hyoshihara04',
          root: 'daily/hyoshihara04',
          teamName: 'bomberowl-test',
        });
      });
    });

    describe('when target post has no category before yyyy/mm/dd', () => {
      beforeEach(() => {
        document.body.innerHTML = headerWithoutRootCategory;
      });

      it('should return info', () => {
        const date = new moment('2018/02/16', 'YYYY/MM/DD');
        expect(Extractor.currentPostInfo()).toEqual({
          date: date,
          name: 'hyoshihara04',
          root: '',
          teamName: 'bomberowl-test',
        });
      });
    });
  });
});
