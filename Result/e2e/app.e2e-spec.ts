import { ResultPage } from './app.po';

describe('result App', function() {
  let page: ResultPage;

  beforeEach(() => {
    page = new ResultPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
