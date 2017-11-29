describe('raceconditions with multi-account-containers', () => {
  describe('when not previously clicked url loads thats set to "always open in $container" but not "remember my choice"', () => {
    it('should close first confirm page and leave the second open', async () => {
      // request comes in, we cancel it, close the tab and reopen in temp container
      const fakeRequest = {
        tabId: 1,
        url: 'https://example.com'
      };
      const fakeTab = {
        id: 1,
        cookieStoreId: 'firefox-default'
      };
      const fakeCreatedTab = {
        id: 2,
        cookieStoreId: 'firefox-tmp-container-1'
      };
      const fakeContainer = {
        cookieStoreId: 'firefox-tmp-container-1'
      };
      browser.tabs.get.resolves(fakeTab);
      browser.contextualIdentities.create.resolves(fakeContainer);
      browser.tabs.create.resolves(fakeCreatedTab);
      const background = await loadBackground();
      const result1 = await background.webRequestOnBeforeRequest(fakeRequest);

      result1.should.deep.equal({cancel: true});
      browser.tabs.remove.should.have.been.calledWith(1);
      browser.contextualIdentities.create.should.have.been.calledOnce;
      browser.tabs.create.should.have.been.calledOnce;

      // the tab 2 we opened now makes its request
      // should normally go through (hence we do nothing)
      const fakeRequest2 = {
        tabId: 2,
        url: 'https://example.com'
      };
      const fakeTab2 = {
        id: 2,
        cookieStoreId: 'firefox-tmp-container-1'
      };
      browser.contextualIdentities.create.reset();
      browser.tabs.create.reset();
      browser.tabs.get.resolves(fakeTab2);
      const result2 = await background.webRequestOnBeforeRequest(fakeRequest2);

      expect(result2).to.be.undefined;
      browser.contextualIdentities.create.should.not.have.been.called;
      browser.tabs.create.should.not.have.been.called;

      // the first request already triggered multi-account-containers
      // it opened another tab that updates its url to moz-extension:// eventually
      // it also already removed our tab2
      // so we're now going to remove it
      const fakeMATabId = 3;
      const fakeMAUrl = 'moz-extension://multi-account-containers/confirm-page.html?url=' +
        encodeURIComponent('https://example.com') + '&cookieStoreId=firefox-container-1';
      const fakeMAChangeInfo = {
        url: fakeMAUrl
      };
      const fakeMATab = {
        id: fakeMATabId,
        cookieStoreId: 'firefox-default',
        url: fakeMAUrl
      };

      browser.tabs.remove.reset();
      const result3 = await background.tabsOnUpdated(fakeMATabId, fakeMAChangeInfo, fakeMATab);

      expect(result3).to.be.undefined;
      browser.tabs.remove.should.have.been.calledWith(3);

      // tab 2 opening the url in another container triggered multi-account-containers again
      // but this time its ok and we should leave the confirm page open
      const fakeMATabId2 = 3;
      const fakeMAUrl2 = 'moz-extension://multi-account-containers/confirm-page.html?url=' +
        encodeURIComponent('https://example.com') + '&cookieStoreId=firefox-container-1' +
        '&currentCookieStoreId=firefox-tmp-container-1';
      const fakeMAChangeInfo2 = {
        url: fakeMAUrl2
      };
      const fakeMATab2 = {
        id: fakeMATabId2,
        cookieStoreId: 'firefox-default',
        url: fakeMAUrl2
      };

      browser.tabs.remove.reset();
      const result4 = await background.tabsOnUpdated(fakeMATabId2, fakeMAChangeInfo2, fakeMATab2);

      expect(result4).to.be.undefined;
      browser.tabs.remove.should.not.have.been.called;
    });
  });

  describe('when previously clicked url loads thats set to "always open in $container" but not "remember my choice"', () => {
    it('should close first confirm page and leave the second open', async () => {
      // simulate click
      const fakeSender = {
        tab: {
          id: 123,
          cookieStoreId: 'firefox-tmp-container-123',
          url: 'https://notexample.com'
        }
      };
      const fakeMessage = {
        linkClicked: {
          href: 'https://example.com',
          event: {
            button: 1,
            ctrlKey: false
          }
        }
      };
      const background = await loadBackground();
      await background.runtimeOnMessage(fakeMessage, fakeSender);
      background.automaticModeState.linkClicked[fakeMessage.linkClicked.href].should.exist;

      // request comes in, we cancel it, close the tab and reopen in temp container
      const fakeRequest = {
        tabId: 1,
        url: 'https://example.com'
      };
      const fakeTab = {
        id: 1,
        openerTabId: 123,
        cookieStoreId: 'firefox-tmp-container-123'
      };
      const fakeCreatedTab = {
        id: 2,
        cookieStoreId: 'firefox-tmp-container-1'
      };
      const fakeContainer = {
        cookieStoreId: 'firefox-tmp-container-1'
      };
      browser.tabs.get.resolves(fakeTab);
      browser.contextualIdentities.create.resolves(fakeContainer);
      browser.tabs.create.resolves(fakeCreatedTab);
      const result1 = await background.webRequestOnBeforeRequest(fakeRequest);

      result1.should.deep.equal({cancel: true});
      browser.tabs.remove.should.have.been.calledWith(1);
      browser.contextualIdentities.create.should.have.been.calledOnce;
      browser.tabs.create.should.have.been.calledOnce;

      // the tab 2 we opened now makes its request
      // should normally go through (hence we do nothing)
      const fakeRequest2 = {
        tabId: 2,
        url: 'https://example.com'
      };
      const fakeTab2 = {
        id: 2,
        cookieStoreId: 'firefox-tmp-container-1'
      };
      browser.contextualIdentities.create.reset();
      browser.tabs.create.reset();
      browser.tabs.get.resolves(fakeTab2);
      const result2 = await background.webRequestOnBeforeRequest(fakeRequest2);

      expect(result2).to.be.undefined;
      browser.contextualIdentities.create.should.not.have.been.called;
      browser.tabs.create.should.not.have.been.called;

      // the first request already triggered multi-account-containers
      // it opened another tab that updates its url to moz-extension:// eventually
      // it also already removed our tab2
      // so we're now going to remove it
      const fakeMATabId = 3;
      const fakeMAUrl = 'moz-extension://multi-account-containers/confirm-page.html?url=' +
        encodeURIComponent('https://example.com') + '&cookieStoreId=firefox-container-1';
      const fakeMAChangeInfo = {
        url: fakeMAUrl
      };
      const fakeMATab = {
        id: fakeMATabId,
        cookieStoreId: 'firefox-default',
        url: fakeMAUrl
      };

      browser.tabs.remove.reset();
      const result3 = await background.tabsOnUpdated(fakeMATabId, fakeMAChangeInfo, fakeMATab);

      expect(result3).to.be.undefined;
      browser.tabs.remove.should.have.been.calledWith(3);

      // tab 2 opening the url in another container triggered multi-account-containers again
      // but this time its ok and we should leave the confirm page open
      const fakeMATabId2 = 3;
      const fakeMAUrl2 = 'moz-extension://multi-account-containers/confirm-page.html?url=' +
        encodeURIComponent('https://example.com') + '&cookieStoreId=firefox-container-1' +
        '&currentCookieStoreId=firefox-tmp-container-1';
      const fakeMAChangeInfo2 = {
        url: fakeMAUrl2
      };
      const fakeMATab2 = {
        id: fakeMATabId2,
        cookieStoreId: 'firefox-default',
        url: fakeMAUrl2
      };

      browser.tabs.remove.reset();
      const result4 = await background.tabsOnUpdated(fakeMATabId2, fakeMAChangeInfo2, fakeMATab2);

      expect(result4).to.be.undefined;
      browser.tabs.remove.should.not.have.been.called;
    });
  });

  describe('when url loads thats set to "always open in $container" and "remember my choice"', () => {
    it('should close the first tab and leave the second open', async () => {
      // simulate click
      const fakeSender = {
        tab: {
          id: 1,
          cookieStoreId: 'firefox-tmp-container-1',
          url: 'https://notexample.com'
        }
      };
      const fakeMessage = {
        linkClicked: {
          href: 'https://example.com',
          event: {
            button: 1,
            ctrlKey: false
          }
        }
      };
      const background = await loadBackground();
      await background.runtimeOnMessage(fakeMessage, fakeSender);
      background.automaticModeState.linkClicked[fakeMessage.linkClicked.href].should.exist;

      // click created tab 2 which results in this request
      // this should close tab 2 and create a new tab 4
      const fakeRequest = {
        tabId: 2,
        url: 'https://example.com'
      };
      const fakeTab = {
        id: 2,
        cookieStoreId: 'firefox-tmp-container-1',
        openerTabId: 1
      };
      const fakeContainer = {
        cookieStoreId: 'firefox-tmp-container-2'
      };
      browser.tabs.get.resolves(fakeTab);
      browser.contextualIdentities.create.resolves(fakeContainer);
      browser.tabs.create.resolves(fakeTab);
      const result1 = await background.webRequestOnBeforeRequest(fakeRequest);

      result1.should.deep.equal({cancel: true});
      browser.contextualIdentities.create.should.have.been.calledOnce;
      browser.tabs.create.should.have.been.calledOnce;
      browser.tabs.remove.should.have.been.calledWith(2);

      // multi-account-containers saw the same request
      // canceled the request, closed tab 2, created its own tab 3
      // and that results in this request
      // which in turn should be detected as MA request, canceled and tab closed
      const fakeMultiAccountRequest = {
        tabId: 3,
        url: 'https://example.com'
      };
      const fakeMultiAccountTab = {
        id: 3,
        cookieStoreId: 'firefox-ma-container-1'
      };
      browser.tabs.get.resolves(fakeMultiAccountTab);
      browser.tabs.remove.reset();
      await background.webRequestOnBeforeRequest(fakeMultiAccountRequest);

      browser.tabs.remove.should.have.been.calledOnce;
      browser.tabs.remove.should.have.been.calledWith(3);

      // the tab 4 now comes through with its request
      // this should go through even though its gonna be intercepted by MA again
      const fakeRequest2 = {
        tabId: 4,
        url: 'https://example.com'
      };
      const fakeTab2 = {
        id: 4,
        cookieStoreId: 'firefox-tmp-container-2'
      };
      browser.tabs.get.resolves(fakeTab2);
      browser.tabs.remove.reset();
      const result2 = await background.webRequestOnBeforeRequest(fakeRequest2);

      expect(result2).to.be.undefined;
      browser.tabs.remove.should.not.have.been.calledOnce;

      // the tab 4 request triggered MA and here's that request
      // it should go through and not be closed
      const fakeMultiAccountRequest2 = {
        tabId: 5,
        url: 'https://example.com'
      };
      const fakeMultiAccountTab2 = {
        id: 5,
        cookieStoreId: 'firefox-ma-container-1'
      };
      browser.tabs.get.resolves(fakeMultiAccountTab2);
      browser.tabs.remove.reset();
      await background.webRequestOnBeforeRequest(fakeMultiAccountRequest2);

      browser.tabs.remove.should.not.have.been.called;
    });
  });
});
